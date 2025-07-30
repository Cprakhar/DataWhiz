package nosql

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/cprakhar/datawhiz/config"
	"github.com/cprakhar/datawhiz/internal/database/schema"
	"go.mongodb.org/mongo-driver/v2/bson"
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

func CreateMongoDBConnectionString(conn *schema.ManualConnectionForm) (string, error) {
	if conn.Host == "" {
		conn.Host = "localhost"
	}
	if conn.Port == "" {
		conn.Port = "27017" // Default MongoDB port
	}

	// Construct the connection string
	connStr := "mongodb://" + conn.Username + ":" + conn.Password + "@" + conn.Host + ":" + conn.Port + "/" + conn.DBName

	if conn.SSLMode {
		connStr += "?ssl=true"
	} else {
		connStr += "?ssl=false"
	}

	return connStr, nil
}

func ExtractMongoDBDetails(conn *schema.StringConnectionForm) (*schema.ManualConnectionForm, error) {
	// Assuming the connection string is in the format:
	// mongodb://username:password@host:port/dbname?ssl=require|disable

	parts := strings.SplitN(conn.ConnString, "://", 2)
	if len(parts) != 2 {
		return nil, errors.New("invalid MongoDB connection string format")
	}

	connDetails := &schema.ManualConnectionForm{
		DBType:   conn.DBType,
		ConnName: conn.ConnName,
	}

	userPassHost := strings.SplitN(parts[1], "@", 2)
	if len(userPassHost) != 2 {
		return nil, errors.New("invalid MongoDB connection string format")
	}
	userPass := strings.SplitN(userPassHost[0], ":", 2)
	if len(userPass) != 2 {
		return nil, errors.New("invalid MongoDB connection string format")
	}
	connDetails.Username = userPass[0]
	connDetails.Password = userPass[1]

	hostPortDB := strings.SplitN(userPassHost[1], "/", 2)
	if len(hostPortDB) != 2 {
		return nil, errors.New("invalid MongoDB connection string format")
	}
	hostPort := strings.SplitN(hostPortDB[0], ":", 2)
	if len(hostPort) == 2 {
		connDetails.Host = hostPort[0]
		connDetails.Port = hostPort[1]
	} else {
		connDetails.Host = hostPort[0]
		connDetails.Port = "27017" // Default MongoDB port
	}
	connDetails.DBName = hostPortDB[1]

	connDetails.SSLMode = false // default
	for _, param := range strings.Split(parts[1], "&") {
		if after, ok := strings.CutPrefix(param, "ssl="); ok {
			connDetails.SSLMode = (after == "require")
			break
		}
	}

	return connDetails, nil
}

type MongoDBCollection struct {
	DBName      string   `json:"dbName"`
	Collections []string `json:"collections"`
}

// GetMongoDBCollections retrieves all collections from all databases in the MongoDB pool.
func GetMongoDBCollections(pool *mongo.Client) ([]MongoDBCollection, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	databases, err := pool.ListDatabaseNames(ctx, bson.D{})
	if err != nil {
		return nil, err
	}

	var result []MongoDBCollection
	var skippedDBs []string
	for _, dbName := range databases {
		db := pool.Database(dbName)
		colls, err := db.ListCollectionNames(ctx, bson.D{})
		if err != nil {
			// Skip databases that return an error (e.g., empty or no access)
			skippedDBs = append(skippedDBs, dbName)
			continue
		}
		result = append(result, MongoDBCollection{
			DBName:      dbName,
			Collections: colls,
		})
	}

	if len(result) == 0 && len(skippedDBs) > 0 {
		return nil, errors.New("no collections found; skipped databases: " + strings.Join(skippedDBs, ", "))
	}

	return result, nil
}
