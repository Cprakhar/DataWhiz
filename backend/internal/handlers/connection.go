package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"datawhiz/internal/db"
	"datawhiz/internal/models"
	cache "datawhiz/internal/utils"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ConnectRequest struct {
	DBType     string `json:"db_type" binding:"required"`
	ConnString string `json:"conn_string" binding:"required"`
	Name       string `json:"name"`
}

var schemaCache = cache.NewCache()

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
	// Validate connection before saving
	switch req.DBType {
	case "sqlite":
		dbConn, err := db.OpenSQLite(req.ConnString)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid SQLite connection string"})
			return
		}
		dbConn.Close()
	case "postgres":
		if err := validatePostgres(req.ConnString); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid PostgreSQL connection string"})
			return
		}
	case "mysql":
		if err := validateMySQL(req.ConnString); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid MySQL connection string"})
			return
		}
	case "mongodb":
		if err := validateMongo(req.ConnString); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid MongoDB connection string"})
			return
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported DB type"})
		return
	}
	// Encrypt connection string
	encryptedConn, err := db.Encrypt(req.ConnString)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt connection string"})
		return
	}

	// Check for duplicate (same user, same db_type, same decrypted conn_string)
	var existing []models.Connection
	if err := db.DB.Where("user_id = ? AND db_type = ?", userID, req.DBType).Find(&existing).Error; err == nil {
		for _, ex := range existing {
			dec, derr := db.Decrypt(ex.ConnString)
			if derr == nil && dec == req.ConnString {
				c.JSON(http.StatusConflict, gin.H{"error": "Duplicate connection: this connection string already exists for this user and database type."})
				return
			}
		}
	}

	conn := models.Connection{
		UserID:     userID,
		DBType:     req.DBType,
		ConnString: encryptedConn,
		CreatedAt:  time.Now(),
		Name:       req.Name,
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
	// Validate connection only, do not save
	switch req.DBType {
	case "sqlite":
		dbConn, err := db.OpenSQLite(req.ConnString)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid SQLite connection string"})
			return
		}
		dbConn.Close()
	case "postgres":
		if err := validatePostgres(req.ConnString); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid PostgreSQL connection string"})
			return
		}
	case "mysql":
		if err := validateMySQL(req.ConnString); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid MySQL connection string"})
			return
		}
	case "mongodb":
		if err := validateMongo(req.ConnString); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid MongoDB connection string"})
			return
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported DB type"})
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
		var pingErr error
		switch conn.DBType {
		case "sqlite":
			dbConn, err := db.OpenSQLite(connStr)
			if err == nil {
				pingErr = dbConn.Ping()
				dbConn.Close()
			} else {
				pingErr = err
			}
		case "postgres":
			dbConn, err := sql.Open("postgres", connStr)
			if err == nil {
				pingErr = dbConn.Ping()
				dbConn.Close()
			} else {
				pingErr = err
			}
		case "mysql":
			dbConn, err := sql.Open("mysql", connStr)
			if err == nil {
				pingErr = dbConn.Ping()
				dbConn.Close()
			} else {
				pingErr = err
			}
		case "mongodb":
			ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
			client, err := mongo.Connect(ctx, options.Client().ApplyURI(connStr))
			if err == nil {
				pingErr = client.Ping(ctx, nil)
				client.Disconnect(ctx)
			} else {
				pingErr = err
			}
			cancel()
		default:
			pingErr = fmt.Errorf("unsupported db type")
		}
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

func SchemaIntrospectionHandler(c *gin.Context) {
	connID := c.Param("connection_id")
	userID, ok := getUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or missing token"})
		return
	}
	cacheKey := fmt.Sprintf("schema:%d:%s", userID, connID)
	if cached, found := schemaCache.Get(cacheKey); found {
		c.JSON(http.StatusOK, cached)
		return
	}
	var conn models.Connection
	if err := db.DB.Where("id = ? AND user_id = ?", connID, userID).First(&conn).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Connection not found"})
		return
	}
	// Decrypt connection string
	connStr, err := db.Decrypt(conn.ConnString)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decrypt connection string"})
		return
	}
	if conn.DBType == "sqlite" {
		dbConn, err := db.OpenSQLite(connStr)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to DB"})
			return
		}
		defer dbConn.Close()
		rows, err := dbConn.Query("SELECT name FROM sqlite_master WHERE type='table'")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list tables"})
			return
		}
		tables := []map[string]interface{}{}
		for rows.Next() {
			var tableName string
			if err := rows.Scan(&tableName); err != nil {
				continue
			}
			// Get columns for each table
			colRows, err := dbConn.Query("PRAGMA table_info(" + tableName + ")")
			if err != nil {
				continue
			}
			cols := []string{}
			for colRows.Next() {
				var cid int
				var name, ctype string
				var notnull, pk int
				var dfltValue interface{}
				colRows.Scan(&cid, &name, &ctype, &notnull, &dfltValue, &pk)
				cols = append(cols, name)
			}
			tables = append(tables, map[string]interface{}{"name": tableName, "columns": cols})
		}
		// At the end, before returning response:
		if tables != nil {
			schemaCache.Set(cacheKey, gin.H{"tables": tables}, 5*time.Minute)
		}
		c.JSON(http.StatusOK, gin.H{"tables": tables})
		return
	}
	if conn.DBType == "postgres" {
		dbConn, err := sql.Open("postgres", connStr)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to DB"})
			return
		}
		defer dbConn.Close()
		rows, err := dbConn.Query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list tables"})
			return
		}
		tables := []map[string]interface{}{}
		for rows.Next() {
			var tableName string
			if err := rows.Scan(&tableName); err != nil {
				continue
			}
			colRows, err := dbConn.Query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", tableName)
			if err != nil {
				continue
			}
			cols := []string{}
			for colRows.Next() {
				var colName string
				colRows.Scan(&colName)
				cols = append(cols, colName)
			}
			tables = append(tables, map[string]interface{}{"name": tableName, "columns": cols})
		}
		// At the end, before returning response:
		if tables != nil {
			schemaCache.Set(cacheKey, gin.H{"tables": tables}, 5*time.Minute)
		}
		c.JSON(http.StatusOK, gin.H{"tables": tables})
		return
	}
	if conn.DBType == "mysql" {
		dbConn, err := sql.Open("mysql", connStr)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to DB"})
			return
		}
		defer dbConn.Close()
		rows, err := dbConn.Query("SHOW TABLES")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list tables"})
			return
		}
		tables := []map[string]interface{}{}
		for rows.Next() {
			var tableName string
			if err := rows.Scan(&tableName); err != nil {
				continue
			}
			colRows, err := dbConn.Query("SHOW COLUMNS FROM " + tableName)
			if err != nil {
				continue
			}
			cols := []string{}
			for colRows.Next() {
				var colName string
				colRows.Scan(&colName)
				cols = append(cols, colName)
			}
			tables = append(tables, map[string]interface{}{"name": tableName, "columns": cols})
		}
		// At the end, before returning response:
		if tables != nil {
			schemaCache.Set(cacheKey, gin.H{"tables": tables}, 5*time.Minute)
		}
		c.JSON(http.StatusOK, gin.H{"tables": tables})
		return
	}
	if conn.DBType == "mongodb" {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		client, err := mongo.Connect(ctx, options.Client().ApplyURI(connStr))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to MongoDB"})
			return
		}
		defer client.Disconnect(ctx)
		dbName := "test" // TODO: parse from connStr or store in model
		dbObj := client.Database(dbName)
		colls, err := dbObj.ListCollectionNames(ctx, struct{}{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list collections"})
			return
		}
		tables := []map[string]interface{}{}
		for _, coll := range colls {
			// For Mongo, just list collection names
			tables = append(tables, map[string]interface{}{"name": coll, "columns": []string{}})
		}
		// At the end, before returning response:
		if tables != nil {
			schemaCache.Set(cacheKey, gin.H{"tables": tables}, 5*time.Minute)
		}
		c.JSON(http.StatusOK, gin.H{"tables": tables})
		return
	}
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Schema introspection not implemented for this DB type"})
}

func validatePostgres(connStr string) error {
	dbConn, err := sql.Open("postgres", connStr)
	if err != nil {
		return err
	}
	defer dbConn.Close()
	return dbConn.Ping()
}

func validateMySQL(connStr string) error {
	dbConn, err := sql.Open("mysql", connStr)
	if err != nil {
		return err
	}
	defer dbConn.Close()
	return dbConn.Ping()
}

func validateMongo(connStr string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(connStr))
	if err != nil {
		return err
	}
	defer client.Disconnect(ctx)
	return client.Ping(ctx, nil)
}
