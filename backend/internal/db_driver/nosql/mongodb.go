package nosql

import (
	"context"
	"strconv"
	"time"

	"github.com/cprakhar/datawhiz/config"
	"github.com/cprakhar/datawhiz/internal/database/schema"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// PingMongoDB pings the MongoDB server to check if it's reachable.
func PingMongoDB(pool *mongo.Client) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := pool.Ping(ctx, nil)
	if err != nil {
		return err
	}
	return nil
}

// NewMongoDBClient creates a new MongoDB pool with the provided connection string.
func NewMongoDBPool(dbCfg *config.DBConfig, connStr string) (*mongo.Client, error) {
	poolOpts := options.Client().ApplyURI(connStr)
	poolOpts.SetMaxPoolSize(uint64(dbCfg.MaxOpenConns))
	poolOpts.SetMaxConnIdleTime(dbCfg.ConnMaxIdleTime)

	pool, err := mongo.Connect(poolOpts)
	if err != nil {
		return nil, err
	}

	if err := PingMongoDB(pool); err != nil {
		pool.Disconnect(context.Background())
		return nil, err
	}

	return pool, nil
}

func CreateMongoDBConnectionString(conn *schema.ConnectionRequest) (string, error) {
	if conn.Host == "" {
		conn.Host = "localhost"
	}
	if conn.Port == 0 {
		conn.Port = 27017 // Default MongoDB port
	}

	// Construct the connection string
	connStr := "mongodb://" + conn.Username + ":" + conn.Password + "@" + conn.Host + ":" + strconv.Itoa(conn.Port) + "/" + conn.DBName

	if conn.SSLMode == "require" {
		connStr += "?ssl=true"
	} else {
		connStr += "?ssl=false"
	}

	return connStr, nil
}
