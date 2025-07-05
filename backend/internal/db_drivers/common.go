package db_drivers

import (
	"errors"
	"strings"
)

// ExecuteQuery dispatches query execution to the correct DB driver and returns the result as []map[string]interface{} for SQL DBs or []map[string]interface{} for MongoDB
func ExecuteQuery(dbType, connStr, query string) (interface{}, error) {
	switch dbType {
	case DBTypeSQLite:
		dbConn, err := OpenSQLite(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		rows, err := dbConn.Query(query)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		cols, _ := rows.Columns()
		results := []map[string]interface{}{}
		for rows.Next() {
			columns := make([]interface{}, len(cols))
			columnPointers := make([]interface{}, len(cols))
			for i := range columns {
				columnPointers[i] = &columns[i]
			}
			if err := rows.Scan(columnPointers...); err != nil {
				continue
			}
			rowMap := map[string]interface{}{}
			for i, colName := range cols {
				val := columnPointers[i].(*interface{})
				rowMap[colName] = *val
			}
			results = append(results, rowMap)
		}
		return results, nil
	case DBTypePostgres:
		normalized := connStr
		if strings.HasPrefix(connStr, "postgresql://") {
			normalized = "postgres://" + connStr[len("postgresql://"):]
		}
		dbConn, err := OpenPostgres(normalized)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		rows, err := dbConn.Query(query)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		cols, _ := rows.Columns()
		results := []map[string]interface{}{}
		for rows.Next() {
			columns := make([]interface{}, len(cols))
			columnPointers := make([]interface{}, len(cols))
			for i := range columns {
				columnPointers[i] = &columns[i]
			}
			if err := rows.Scan(columnPointers...); err != nil {
				continue
			}
			rowMap := map[string]interface{}{}
			for i, colName := range cols {
				val := columnPointers[i].(*interface{})
				rowMap[colName] = *val
			}
			results = append(results, rowMap)
		}
		return results, nil
	case DBTypeMySQL:
		dbConn, err := OpenMySQL(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		rows, err := dbConn.Query(query)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		cols, _ := rows.Columns()
		results := []map[string]interface{}{}
		for rows.Next() {
			columns := make([]interface{}, len(cols))
			columnPointers := make([]interface{}, len(cols))
			for i := range columns {
				columnPointers[i] = &columns[i]
			}
			if err := rows.Scan(columnPointers...); err != nil {
				continue
			}
			rowMap := map[string]interface{}{}
			for i, colName := range cols {
				val := columnPointers[i].(*interface{})
				rowMap[colName] = *val
			}
			results = append(results, rowMap)
		}
		return results, nil
	case DBTypeMongo:
		dbName := ExtractMongoDBName(connStr)
		client, ctx, cancel, err := OpenMongoDB(connStr)
		if err != nil {
			return nil, err
		}
		defer cancel()
		defer client.Disconnect(ctx)
		coll := client.Database(dbName).Collection(query)
		cur, err := coll.Find(ctx, struct{}{})
		if err != nil {
			return nil, err
		}
		var docs []map[string]interface{}
		if err := cur.All(ctx, &docs); err != nil {
			return nil, err
		}
		return docs, nil
	default:
		return nil, ErrUnsupportedDBType
	}
}

// PingConnection pings the database for the given type and connection string
func PingConnection(dbType, connStr string) error {
	switch dbType {
	case DBTypeSQLite:
		dbConn, err := OpenSQLite(connStr)
		if err != nil {
			return err
		}
		defer dbConn.Close()
		return dbConn.Ping()
	case DBTypePostgres:
		normalized := connStr
		if strings.HasPrefix(connStr, "postgresql://") {
			normalized = "postgres://" + connStr[len("postgresql://"):]
		}
		dbConn, err := OpenPostgres(normalized)
		if err != nil {
			return err
		}
		defer dbConn.Close()
		return dbConn.Ping()
	case DBTypeMySQL:
		dbConn, err := OpenMySQL(connStr)
		if err != nil {
			return err
		}
		defer dbConn.Close()
		return dbConn.Ping()
	case DBTypeMongo:
		client, ctx, cancel, err := OpenMongoDB(connStr)
		if err != nil {
			return err
		}
		defer cancel()
		defer client.Disconnect(ctx)
		return client.Ping(ctx, nil)
	default:
		return ErrUnsupportedDBType
	}
}

// DBType constants for supported database types
const (
	DBTypeSQLite   = "sqlite"
	DBTypePostgres = "postgresql"
	DBTypeMySQL    = "mysql"
	DBTypeMongo    = "mongodb"
)

// IntrospectSchema dispatches schema introspection to the correct DB driver
func IntrospectSchema(dbType, connStr string) ([]map[string]interface{}, error) {
	switch dbType {
	case DBTypeSQLite:
		dbConn, err := OpenSQLite(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		return GetSQLiteTablesAndColumns(dbConn)
	case DBTypePostgres:
		normalized := connStr
		if strings.HasPrefix(connStr, "postgresql://") {
			normalized = "postgres://" + connStr[len("postgresql://"):]
		}
		dbConn, err := OpenPostgres(normalized)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		return GetPostgresTablesAndColumns(dbConn)
	case DBTypeMySQL:
		dbConn, err := OpenMySQL(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		return GetMySQLTablesAndColumns(dbConn)
	case DBTypeMongo:
		// Extract DB name from connStr (assume last part of URI path)
		dbName := ExtractMongoDBName(connStr)
		client, ctx, cancel, err := OpenMongoDB(connStr)
		if err != nil {
			return nil, err
		}
		defer cancel()
		defer client.Disconnect(ctx)
		return GetMongoCollections(client, ctx, dbName)
	default:
		return nil, ErrUnsupportedDBType
	}
}

// ErrUnsupportedDBType is returned when an unsupported DB type is used
var ErrUnsupportedDBType = errors.New("unsupported database type")

// DBDriver is an interface for common DB driver operations (optional, for future use)
type DBDriver interface {
	Validate(connStr string) error
}