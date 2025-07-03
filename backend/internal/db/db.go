package db

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"database/sql"
	"datawhiz/internal/models"
	"encoding/base64"
	"io"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	DB            *gorm.DB
	encryptionKey []byte
)

func SetEncryptionKeyFromEnv() {
	key := os.Getenv("CONN_ENCRYPTION_KEY")
	if len(key) != 16 && len(key) != 24 && len(key) != 32 {
		print(key)
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

// OpenSQLite opens a SQLite connection for schema introspection
func OpenSQLite(dsn string) (*sql.DB, error) {
	return sql.Open("sqlite3", dsn)
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

// OpenSQLWithPool opens a SQL connection with pooling settings
func OpenSQLWithPool(driver, dsn string) (*sql.DB, error) {
	dbConn, err := sql.Open(driver, dsn)
	if err != nil {
		return nil, err
	}
	// Set reasonable pool settings
	dbConn.SetMaxOpenConns(10)
	dbConn.SetMaxIdleConns(5)
	dbConn.SetConnMaxLifetime(30 * time.Minute)
	return dbConn, nil
}

// OpenMongoWithPool opens a MongoDB client with pooling settings
func OpenMongoWithPool(uri string) (*mongo.Client, context.Context, context.CancelFunc, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	clientOpts := options.Client().ApplyURI(uri).SetMaxPoolSize(10)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		cancel()
		return nil, nil, nil, err
	}
	return client, ctx, cancel, nil
}
