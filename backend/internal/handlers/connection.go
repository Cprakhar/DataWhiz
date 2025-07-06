package handlers

import (
	"net/http"
	"time"

	db "datawhiz/internal/db"
	"datawhiz/internal/models"
	utils "datawhiz/internal/utils"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/jackc/pgx/v5/stdlib"
)

type ConnectRequest struct {
	DBType     string `json:"db_type" binding:"required"`
	ConnString string `json:"conn_string" binding:"required"`
	Name       string `json:"name"`
}

var schemaCache = utils.NewCache()

// getUserIDFromContext now simply reads the user_id set by the AuthRequired middleware
func getUserIDFromContext(c *gin.Context) (uint, bool) {
	val, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}
	userID, ok := val.(uint)
	if !ok {
		return 0, false
	}
	return userID, true
}

func ConnectDBHandler(c *gin.Context) {
	var req ConnectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or missing token"})
		return
	}
	// Validate connection before saving using modular driver
	if err := db.PingConnection(req.DBType, req.ConnString); err != nil {
		if err == db.ErrUnsupportedDBType {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported DB type"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid connection string"})
		}
		return
	}
	// Encrypt connection string
	encryptedConn, err := db.Encrypt(req.ConnString)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt connection string"})
		return
	}

	// Check for duplicate (same user, same db_type, same decrypted conn_string)
	if db.IsDuplicateConnection(userID, req.DBType, req.ConnString) {
		c.JSON(http.StatusConflict, gin.H{"error": "Duplicate connection: this connection string already exists for this user and database type."})
		return
	}

	// Extract host, port, and database name for supported DB types using db_drivers
	host, port, database, err := db.ExtractDBInfo(req.DBType, req.ConnString)
	if err != nil {
		//TODO: 
	}

	conn := models.Connection{
		UserID:     userID,
		DBType:     req.DBType,
		ConnString: encryptedConn,
		CreatedAt:  time.Now(),
		Name:       req.Name,
		Host:       host,
		Port:       port,
		Database:   database,
	}
	if err := db.DB.Create(&conn).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save connection"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"connection_id": conn.ID})
}

// TestDBHandler validates a connection string but does NOT persist it
func TestDBHandler(c *gin.Context) {
	var req ConnectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Validate connection only, do not save, using modular driver
	if err := db.PingConnection(req.DBType, req.ConnString); err != nil {
		if err == db.ErrUnsupportedDBType {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported DB type"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid connection string"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Connection successful"})
}

func ListConnectionsHandler(c *gin.Context) {
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or missing token"})
		return
	}
	var conns []models.Connection
	if err := db.DB.Where("user_id = ?", userID).Find(&conns).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list connections"})
		return
	}

	// For each connection, try to connect and set isConnected and lastConnected
	for i := range conns {
		conn := &conns[i]
		// Decrypt connection string
		connStr, err := db.Decrypt(conn.ConnString)
		if err != nil {
			conn.IsConnected = false
			continue
		}
		pingErr := db.PingConnection(conn.DBType, connStr)
		if pingErr == nil {
			conn.IsConnected = true
			now := time.Now()
			conn.LastConnected = &now
		} else {
			conn.IsConnected = false
			conn.LastConnected = nil
		}
	}
	c.JSON(http.StatusOK, conns)
}

func DisconnectDBHandler(c *gin.Context) {
	id := c.Param("connection_id")
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or missing token"})
		return
	}
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Connection{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete connection"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Connection deleted"})
}