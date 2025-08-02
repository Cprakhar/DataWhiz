package nosql

import (
	"context"
	"errors"
	"log"
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

// CreateMongoDBConnectionString constructs a MongoDB connection string from the provided connection form.
func CreateMongoDBConnectionString(conn *schema.ManualConnectionForm) (string, error) {
	if conn.Host == "" {
		conn.Host = "localhost"
	}
	if conn.Port == "" {
		conn.Port = "27017" // Default MongoDB port
	}

	// Construct the connection string
	var scheme string
	var remaining string
	if conn.IsSRV {
		scheme = "mongodb+srv://"
		remaining = "/" + conn.DBName
	} else {
		scheme = "mongodb://"
		remaining = ":" + conn.Port + "/" + conn.DBName
	}
	connStr := scheme + conn.Username + ":" + conn.Password + "@" + conn.Host + remaining

	if conn.SSLMode {
		connStr += "?ssl=true"
	} else {
		connStr += "?ssl=false"
	}

	log.Println(connStr)
	return connStr, nil
}

// ExtractMongoDBDetails extracts the connection details from a MongoDB connection string.
func ExtractMongoDBDetails(conn *schema.StringConnectionForm) (*schema.ManualConnectionForm, error) {
	// Assuming the connection string is in the format:
	// scheme://username:password@host(:port)?/dbname?ssl=require|disable

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
	// Extract dbName from /dbName?ssl=... by splitting on '?'
	dbNameAndParams := strings.SplitN(hostPortDB[1], "?", 2)
	connDetails.DBName = dbNameAndParams[0]

	connDetails.SSLMode = false // default
	for _, param := range strings.Split(parts[1], "&") {
		if after, ok := strings.CutPrefix(param, "ssl="); ok {
			connDetails.SSLMode = (after == "true")
			break
		}
	}

	return connDetails, nil
}

// GetMongoDBCollections retrieves all collections from all databases in the MongoDB pool.
func GetMongoDBCollections(pool *mongo.Client, dbName string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var result []string
	db := pool.Database(dbName)
	colls, err := db.ListCollectionNames(ctx, bson.D{})
	if err != nil {
		return nil, err
	}
	result = append(result, colls...)

	return result, nil
}

// GetMongoDBCollectionRecords retrieves the records of a specific collection in the MongoDB database.
func GetMongoDBCollectionRecords(pool *mongo.Client, dbName, collectionName string) ([]map[string]interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	col := pool.Database(dbName).Collection(collectionName)
	cursor, err := col.Find(ctx, bson.D{}, options.Find().SetLimit(100))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var records []map[string]interface{}
	for cursor.Next(ctx) {
		var doc bson.M
		if err := cursor.Decode(&doc); err != nil {
			return nil, err
		}
		record := make(map[string]interface{})
		for k, v := range doc {
			record[k] = v
		}
		records = append(records, record)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return records, nil
}
