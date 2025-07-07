package db_drivers

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"datawhiz/internal/models"
	"encoding/base64"
	"errors"
	"io"
	"os"
	"strconv"
	"time"

	"datawhiz/internal/db/nosql_drivers"
	"datawhiz/internal/utils"

	_ "github.com/mattn/go-sqlite3"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	DB            *gorm.DB
	encryptionKey []byte
)

// DBType constants for supported database types
const (
	DBTypeSQLite   = "sqlite"
	DBTypePostgres = "postgresql"
	DBTypeMySQL    = "mysql"
	DBTypeMongoDB  = "mongodb"
)

// --- Use shared cache utility for records ---
var recordCache = utils.NewCache()

func cacheKey(dbType, connStr, tableName string, limit int) string {
	return dbType + ":" + connStr + ":" + tableName + ":" + strconv.Itoa(limit)
}

// ErrUnsupportedDBType is returned when an unsupported DB type is used
var ErrUnsupportedDBType = errors.New("unsupported database type")

// DBDriver is an interface for common DB driver operations (optional, for future use)
type DBDriver interface {
	Validate(connStr string) error
}

func SetEncryptionKeyFromEnv() {
	key := os.Getenv("CONN_ENCRYPTION_KEY")
	if len(key) != 16 && len(key) != 24 && len(key) != 32 {
		panic("CONN_ENCRYPTION_KEY must be set to 16, 24, or 32 bytes (characters) for AES encryption")
	}
	encryptionKey = []byte(key)
}

func InitDB(dsn string) error {
	var err error
	DB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}
	return DB.AutoMigrate(&models.User{}, &models.Connection{}, &models.QueryHistory{})
}

func Encrypt(text string) (string, error) {
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}
	b := []byte(text)
	ciphertext := make([]byte, aes.BlockSize+len(b))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}
	stream := cipher.NewCTR(block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], b)
	return base64.URLEncoding.EncodeToString(ciphertext), nil
}

func Decrypt(cryptoText string) (string, error) {
	ciphertext, err := base64.URLEncoding.DecodeString(cryptoText)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}
	if len(ciphertext) < aes.BlockSize {
		return "", err
	}
	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]
	stream := cipher.NewCTR(block, iv)
	stream.XORKeyStream(ciphertext, ciphertext)
	return string(ciphertext), nil
}

func PingConnection(dbType, connStr string) error {
	switch dbType {
	case DBTypeMongoDB:
		return nosql_drivers.ValidateMongo(connStr)
	default:
		return PingSQLConnection(dbType, connStr)
	}
}

func ExtractDBInfo(dbType, connStr string) (host string, port int, database string, err error) {
	switch dbType {
	case DBTypeMongoDB:
		return nosql_drivers.ExtractMongoDBInfo(connStr)
	default:
		return ExtractSQLDBInfo(dbType, connStr)
	}
}

// isDuplicateConnection checks for duplicate DB connections for a user
func IsDuplicateConnection(userID uint, dbType, connStr string) bool {
	var existing []models.Connection
	if err := DB.Where("user_id = ? AND db_type = ?", userID, dbType).Find(&existing).Error; err != nil {
		return false
	}
	normalizedInput := connStr
	if dbType == "postgresql" && len(connStr) >= 13 && connStr[:13] == "postgresql://" {
		normalizedInput = "postgres://" + connStr[13:]
	}
	for _, ex := range existing {
		dec, derr := Decrypt(ex.ConnString)
		if derr != nil {
			continue
		}
		normalizedExisting := dec
		if dbType == "postgresql" && len(dec) >= 13 && dec[:13] == "postgresql://" {
			normalizedExisting = "postgres://" + dec[13:]
		}
		if normalizedExisting == normalizedInput {
			return true
		}
	}
	return false
}

func IntrospectSchema(dbType, connStr string) ([]map[string]any, error) {
	switch dbType {
	case DBTypeMongoDB:
		client, ctx, cancel, err := nosql_drivers.OpenMongoDB(connStr)
		if err != nil {
			return nil, err
		}
		defer cancel()
		defer client.Disconnect(ctx)

		dbName := ""
		_, _, dbName, err = nosql_drivers.ExtractMongoDBInfo(connStr)
		if err != nil {
			return nil, err
		}
		return nosql_drivers.GetMongoCollections(client, ctx, dbName)
	case DBTypeSQLite, DBTypePostgres, DBTypeMySQL:
		return IntrospectSQLSchema(dbType, connStr)
	default:
		return nil, ErrUnsupportedDBType
	}
}

// GetTableMetadata returns column metadata for a given table for supported DBs
func GetTableMetadata(dbType, connStr, tableName string) (any, error) {
	switch dbType {
	case DBTypeMongoDB:
		_, _, dbName, err := nosql_drivers.ExtractMongoDBInfo(connStr)
		if err != nil {
			return nil, err
		}
		client, ctx, cancel, err := nosql_drivers.OpenMongoDB(connStr)
		if err != nil {
			return nil, err
		}
		defer cancel()
		defer client.Disconnect(ctx)
		return nosql_drivers.GetMongoCollectionMetadata(client, ctx, dbName, tableName)
	default:
		return GetSQLTableMetadata(dbType, connStr, tableName)
	}
}

// GetAllRecords fetches all records from a table/collection for any supported DB type.
// For SQL DBs, returns []map[string]interface{} from the table. For MongoDB, returns all documents as []map[string]interface{}.
// The limit parameter is optional: 0 means no limit (all records).
func GetAllRecords(dbType, connStr, tableName string, limit int) ([]map[string]interface{}, error) {
	// Use ExtractDBInfo for all DB types
	_, _, dbName, err := ExtractDBInfo(dbType, connStr)
	if err != nil {
		return nil, err
	}

	// --- CACHE LOGIC ---
	key := cacheKey(dbType, connStr, tableName, limit)
	if cached, found := recordCache.Get(key); found {
		if records, ok := cached.([]map[string]interface{}); ok {
			return records, nil
		}
	}

	var records []map[string]interface{}
	switch dbType {
	case DBTypeMongoDB:
		client, ctx, cancel, err := nosql_drivers.OpenMongoDB(connStr)
		if err != nil {
			return nil, err
		}
		defer cancel()
		defer client.Disconnect(ctx)
		var lim int64 = 0
		if limit > 0 {
			lim = int64(limit)
		}
		records, err = nosql_drivers.GetAllRecords(client, ctx, dbName, tableName, lim)
		if err != nil {
			return nil, err
		}
	case DBTypeSQLite, DBTypePostgres, DBTypeMySQL:
		records, err = SQLGetAllRecords(dbType, connStr, tableName, limit)
		if err != nil {
			return nil, err
		}
	default:
		return nil, ErrUnsupportedDBType
	}

	// Store in cache with TTL 30 min
	recordCache.Set(key, records, 30*time.Minute)
	return records, nil
}
