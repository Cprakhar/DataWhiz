package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"datawhiz/internal/utils"
	"datawhiz/internal/db"
	"datawhiz/internal/middleware"
	"datawhiz/internal/models"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-jwt/jwt/v5"
	_ "github.com/lib/pq"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ConnectRequest struct {
	DBType     string `json:"db_type" binding:"required"`
	ConnString string `json:"conn_string" binding:"required"`
}

var schemaCache = cache.NewCache()

func getUserIDFromContext(c *gin.Context) (uint, bool) {
	header := c.GetHeader("Authorization")
	tokenStr := ""
	if len(header) > 7 && header[:7] == "Bearer " {
		tokenStr = header[7:]
	}
	parsed, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return middleware.JwtSecret, nil
	})
	if err != nil || !parsed.Valid {
		return 0, false
	}
	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok || claims["user_id"] == nil {
		return 0, false
	}
	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return 0, false
	}
	return uint(userIDFloat), true
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
	conn := models.Connection{
		UserID:     userID,
		DBType:     req.DBType,
		ConnString: encryptedConn,
		CreatedAt:  time.Now(),
	}
	if err := db.DB.Create(&conn).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save connection"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"connection_id": conn.ID})
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
