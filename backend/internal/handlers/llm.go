package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"datawhiz/internal/db"
	"datawhiz/internal/llm"
	"datawhiz/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/time/rate"
)

var llmLimiter = rate.NewLimiter(1, 3) // 1 request/sec, burst 3

type GenerateQueryRequest struct {
	ConnectionID uint   `json:"connection_id" binding:"required"`
	Prompt       string `json:"prompt" binding:"required"`
}

type LLMResponse struct {
	Query string `json:"query"`
}

func GenerateQueryHandler(c *gin.Context) {
	if !llmLimiter.Allow() {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
		return
	}
	var req GenerateQueryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or missing token"})
		return
	}
	var conn models.Connection
	if err := db.DB.Where("id = ? AND user_id = ?", req.ConnectionID, userID).First(&conn).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Connection not found"})
		return
	}
	connStr, err := db.Decrypt(conn.ConnString)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decrypt connection string"})
		return
	}
	// Call LLM to generate query
	llmQuery, err := llm.CallGeminiLLM(req.Prompt, conn.DBType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "LLM error: " + err.Error()})
		return
	}
	// Execute the generated query (reuse logic from ExecuteQueryHandler)
	var result interface{}
	var dbType = conn.DBType
	if dbType == "sqlite" || dbType == "postgres" || dbType == "mysql" {
		dbConn, err := sql.Open(dbType, connStr)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to DB"})
			return
		}
		defer dbConn.Close()
		rows, err := dbConn.Query(llmQuery)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "llm_query": llmQuery})
			return
		}
		cols, _ := rows.Columns()
		results := []map[string]interface{}{}
		for rows.Next() {
			columns := make([]interface{}, len(cols))
			columnPointers := make([]interface{}, len(cols))
			for i := range columns {
				columnPointers[i] = &columns[i]
			}
			if err := rows.Scan(columnPointers...); err != nil {
				continue
			}
			rowMap := map[string]interface{}{}
			for i, colName := range cols {
				val := columnPointers[i].(*interface{})
				rowMap[colName] = *val
			}
			results = append(results, rowMap)
		}
		result = results
	} else if dbType == "mongodb" {
		// For Mongo, just list all docs in a collection named in the prompt
		ctx, cancel := context.WithTimeout(c, 10*time.Second)
		defer cancel()
		client, err := mongo.Connect(ctx, options.Client().ApplyURI(connStr))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to MongoDB"})
			return
		}
		defer client.Disconnect(ctx)
		coll := client.Database("test").Collection(llmQuery) // TODO: parse db name
		cur, err := coll.Find(ctx, struct{}{})
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "llm_query": llmQuery})
			return
		}
		var docs []map[string]interface{}
		if err := cur.All(ctx, &docs); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		result = docs
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported DB type"})
		return
	}
	// Save to query history
	resultSample := ""
	if b, err := json.Marshal(result); err == nil {
		if len(b) > 512 {
			resultSample = string(b[:512]) + "..."
		} else {
			resultSample = string(b)
		}
	}
	db.DB.Create(&models.QueryHistory{
		UserID:         userID,
		Prompt:         req.Prompt,
		GeneratedQuery: llmQuery,
		DBType:         dbType,
		ExecutedAt:     time.Now(),
		ResultSample:   resultSample,
	})
	c.JSON(http.StatusOK, gin.H{"llm_query": llmQuery, "result": result})
}
