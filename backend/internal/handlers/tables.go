package handlers

import (
	db "datawhiz/internal/db"
	"datawhiz/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

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
	for _, t := range tablesList {
		tableName, ok := t["name"].(string)
		if !ok {
			continue
		}
		columns, err := db.GetTableMetadata(conn.DBType, connStr, tableName)
		if err != nil {
			columns = nil
		}
		tables = append(tables, map[string]interface{}{
			"name":    tableName,
			"columns": columns,
		})
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
