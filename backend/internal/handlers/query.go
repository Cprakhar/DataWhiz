package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"datawhiz/internal/db"
	"datawhiz/internal/models"

	"github.com/gin-gonic/gin"
)

type ExecuteQueryRequest struct {
	ConnectionID uint   `json:"connection_id" binding:"required"`
	Query        string `json:"query" binding:"required"`
}

func ExecuteQueryHandler(c *gin.Context) {
	var req ExecuteQueryRequest
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
	var dbType = conn.DBType
	if dbType != "sqlite" && dbType != "postgres" && dbType != "mysql" && dbType != "mongodb" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported DB type"})
		return
	}
	connStr, err := db.Decrypt(conn.ConnString)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decrypt connection string"})
		return
	}
	var result interface{}
	driverName := dbType
	if dbType == "sqlite" {
		driverName = "sqlite3"
	}
	if dbType == "sqlite" || dbType == "postgres" || dbType == "mysql" {
		dbConn, err := db.OpenSQLWithPool(driverName, connStr)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to DB"})
			return
		}
		defer dbConn.Close()
		rows, err := dbConn.Query(req.Query)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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
		client, ctx, cancel, err := db.OpenMongoWithPool(connStr)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to MongoDB"})
			return
		}
		defer cancel()
		defer client.Disconnect(ctx)
		// For Mongo, expect query as collection name
		coll := client.Database("test").Collection(req.Query) // TODO: parse db name
		cur, err := coll.Find(ctx, struct{}{})
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		var docs []map[string]interface{}
		if err := cur.All(ctx, &docs); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		result = docs
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
		Prompt:         req.Query,
		GeneratedQuery: req.Query,
		DBType:         dbType,
		ExecutedAt:     time.Now(),
		ResultSample:   resultSample,
	})
	c.JSON(http.StatusOK, gin.H{"result": result})
}
