package handlers

import (
	db "datawhiz/internal/db"
	"datawhiz/internal/models"
	"datawhiz/internal/utils"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Table metadata cache (per connection+table)
var tableMetadataCache = utils.NewCache()

// GetTablesHandler returns the list of tables and columns for a given connection
func GetTablesHandler(c *gin.Context) {
	connID := c.Param("connection_id")
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or missing token"})
		return
	}
	var conn models.Connection
	if err := db.DB.Where("id = ? AND user_id = ?", connID, userID).First(&conn).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Connection not found"})
		return
	}
	connStr, err := db.Decrypt(conn.ConnString)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decrypt connection string"})
		return
	}
	// Use db.IntrospectSchema to get table names, then fetch metadata for each
	tablesList, err := db.IntrospectSchema(conn.DBType, connStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var tables []map[string]interface{}
	var wg sync.WaitGroup
	tablesCh := make(chan map[string]interface{}, len(tablesList))
	for _, t := range tablesList {
		tableName, ok := t["name"].(string)
		if !ok {
			continue
		}
		wg.Add(1)
		go func(tableName string) {
			defer wg.Done()
			cacheKey := conn.DBType + ":" + connStr + ":" + tableName
			if cached, found := tableMetadataCache.Get(cacheKey); found {
				tablesCh <- map[string]interface{}{"name": tableName, "columns": cached}
				return
			}
			columns, err := db.GetTableMetadata(conn.DBType, connStr, tableName)
			if err != nil {
				tablesCh <- map[string]interface{}{"name": tableName, "columns": nil}
				return
			}
			tableMetadataCache.Set(cacheKey, columns, 30*time.Minute)
			tablesCh <- map[string]interface{}{"name": tableName, "columns": columns}
		}(tableName)
	}
	wg.Wait()
	close(tablesCh)
	for t := range tablesCh {
		tables = append(tables, t)
	}
	c.JSON(http.StatusOK, gin.H{"tables": tables})
}

// GetTableRecordsHandler returns all records for a given table name
func GetTableRecordsHandler(c *gin.Context) {
	connID := c.Param("connection_id")
	tableName := c.Param("table_name")
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or missing token"})
		return
	}
	var conn models.Connection
	if err := db.DB.Where("id = ? AND user_id = ?", connID, userID).First(&conn).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Connection not found"})
		return
	}
	connStr, err := db.Decrypt(conn.ConnString)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decrypt connection string"})
		return
	}
	// Use db.GetAllRecords to fetch all records from the table
	result, err := db.GetAllRecords(conn.DBType, connStr, tableName, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"records": result})
}
