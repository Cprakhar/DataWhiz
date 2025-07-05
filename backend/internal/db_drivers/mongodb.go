package db_drivers

import (
	"context"
	"time"

	"strings"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// OpenMongoDB opens a MongoDB client connection
func OpenMongoDB(connStr string) (*mongo.Client, context.Context, context.CancelFunc, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(connStr))
	if err != nil {
		cancel()
		return nil, nil, nil, err
	}
	return client, ctx, cancel, nil
}

// GetMongoCollections returns a list of collections for a MongoDB database
func GetMongoCollections(client *mongo.Client, ctx context.Context, dbName string) ([]map[string]interface{}, error) {
	dbObj := client.Database(dbName)
	colls, err := dbObj.ListCollectionNames(ctx, struct{}{})
	if err != nil {
		return nil, err
	}
	tables := []map[string]interface{}{}
	for _, coll := range colls {
		tables = append(tables, map[string]interface{}{"name": coll, "columns": []string{}})
	}
	return tables, nil
}

// ValidateMongo validates a MongoDB connection string by connecting and pinging
func ValidateMongo(connStr string) error {
	client, ctx, cancel, err := OpenMongoDB(connStr)
	if err != nil {
		return err
	}
	defer cancel()
	defer client.Disconnect(ctx)
	return client.Ping(ctx, nil)
}

// ExtractMongoDBName extracts the DB name from a MongoDB URI
func ExtractMongoDBName(connStr string) string {
	// mongodb://user:pass@host:port/dbname?params
	// Find "/" after host:port
	idx := strings.LastIndex(connStr, "/")
	if idx == -1 || idx+1 >= len(connStr) {
		return ""
	}
	// Remove any ?params
	dbAndParams := connStr[idx+1:]
	if q := strings.Index(dbAndParams, "?"); q != -1 {
		return dbAndParams[:q]
	}
	return dbAndParams
}
