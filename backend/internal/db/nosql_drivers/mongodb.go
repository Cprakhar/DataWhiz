package nosql_drivers

import (
	"context"
	"net/url"
	"time"

	"strconv"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

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

// OpenMongoDB opens a MongoDB client connection
func OpenMongoDB(connStr string) (*mongo.Client, context.Context, context.CancelFunc, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(connStr))
	if err != nil {
		cancel()
		return nil, nil, nil, err
	}
	return client, ctx, cancel, nil
}

// GetMongoCollections returns a list of collections for a MongoDB database
func GetMongoCollections(client *mongo.Client, ctx context.Context, dbName string) ([]map[string]any, error) {
	dbObj := client.Database(dbName)
	cols, err := dbObj.ListCollectionNames(ctx, struct{}{})
	if err != nil {
		return nil, err
	}
	tables := []map[string]any{}
	for _, col := range cols {
		tables = append(tables, map[string]any{"name": col, "columns": []string{}})
	}
	return tables, nil
}

// GetMongoCollectionMetadata returns inferred column metadata for a MongoDB collection
func GetMongoCollectionMetadata(client *mongo.Client, ctx context.Context, dbName, collectionName string) ([]map[string]string, error) {
	collection := client.Database(dbName).Collection(collectionName)
	var result map[string]any
	err := collection.FindOne(ctx, map[string]any{}).Decode(&result)
	if err != nil {
		// If no documents, return empty slice
		return []map[string]string{}, nil
	}
	columns := []map[string]string{}
	for k, v := range result {
		colType := "unknown"
		switch v.(type) {
		case string:
			colType = "string"
		case int32, int64, int:
			colType = "int"
		case float32, float64:
			colType = "float"
		case bool:
			colType = "bool"
		case map[string]any:
			colType = "object"
		case []any:
			colType = "array"
		}
		columns = append(columns, map[string]string{"name": k, "type": colType})
	}
	return columns, nil
}

// GetAllRecords fetches all documents from a MongoDB collection and returns them as []map[string]interface{}.
func GetAllRecords(client *mongo.Client, ctx context.Context, dbName, collectionName string, limit int64) ([]map[string]interface{}, error) {
	collection := client.Database(dbName).Collection(collectionName)
	findOpts := options.Find()
	if limit > 0 {
		findOpts.SetLimit(limit)
	}
	cursor, err := collection.Find(ctx, map[string]interface{}{}, findOpts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []map[string]interface{}
	for cursor.Next(ctx) {
		var doc map[string]interface{}
		if err := cursor.Decode(&doc); err != nil {
			return nil, err
		}
		results = append(results, doc)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}
	return results, nil
}

// ExtractMongoDBName extracts the DB name from a MongoDB URI
func ExtractMongoDBInfo(connStr string) (host string, port int, database string, err error) {
	// mongodb://user:pass@host:port/dbname?params
	u, err := url.Parse(connStr)
	if err != nil {
		return "", 0, "", err
	}

	host = u.Hostname()
	portStr := u.Port()
	if portStr != "" {
		port, err = strconv.Atoi(portStr)
		if err != nil {
			return "", 0, "", err
		}
	} else {
		port = 27017 // Default MongoDB port
	}

	if len(u.Path) > 1 {
		database = u.Path[1:]
	}
	return
}
