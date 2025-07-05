package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"datawhiz/internal/db"
	dbdrivers "datawhiz/internal/db_drivers"
	"datawhiz/internal/models"
	cache "datawhiz/internal/utils"

	"github.com/gin-gonic/gin"
)

type ExecuteQueryRequest struct {
	ConnectionID uint   `json:"connection_id" binding:"required"`
	Query        string `json:"query" binding:"required"`
}

var queryCache = cache.NewCache()

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
	if dbType != "sqlite" && dbType != "postgresql" && dbType != "mysql" && dbType != "mongodb" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported DB type"})
		return
	}
	connStr, err := db.Decrypt(conn.ConnString)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decrypt connection string"})
		return
	}

	// Cache key: userID:connID:query
	cacheKey := fmt.Sprintf("query:%d:%d:%s", userID, req.ConnectionID, req.Query)
	if cached, found := queryCache.Get(cacheKey); found {
		c.JSON(http.StatusOK, gin.H{"result": cached, "cached": true})
		return
	}

	// Use db_drivers to execute the query in a modular way
	result, err := dbdrivers.ExecuteQuery(dbType, connStr, req.Query)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Save to cache (5 min TTL)
	queryCache.Set(cacheKey, result, 5*time.Minute)

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
	c.JSON(http.StatusOK, gin.H{"result": result, "cached": false})
}
