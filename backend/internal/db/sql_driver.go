package db_drivers

import (
	db "datawhiz/internal/db/sql_drivers"
	"fmt"
	"database/sql"
)

// GetTableMetadata returns column metadata for a given table for supported DBs
func GetSQLTableMetadata(dbType, connStr, tableName string) (any, error) {
	switch dbType {
	case DBTypePostgres:
		dbConn, err := db.OpenPostgres(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		return db.GetPostgresTableMetadata(dbConn, tableName)
	case DBTypeSQLite:
		dbConn, err := db.OpenSQLite(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		return db.GetSQLiteTableMetadata(dbConn, tableName)
	case DBTypeMySQL:
		dbConn, err := db.OpenMySQL(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		return db.GetMySQLTableMetadata(dbConn, tableName)
	default:
		return nil, ErrUnsupportedDBType
	}
}

// PingConnection pings the database for the given type and connection string
func PingSQLConnection(dbType, connStr string) error {
	switch dbType {
	case DBTypeSQLite:
		err := db.ValidateSQLite(connStr)
		if err != nil {
			return err
		}
	case DBTypePostgres:
		err := db.ValidatePostgres(connStr)
		if err != nil {
			return err
		}
	case DBTypeMySQL:
		err := db.ValidateMySQL(connStr)
		if err != nil {
			return err
		}
	default:
		return ErrUnsupportedDBType
	}
	return nil
}

// IntrospectSchema dispatches schema introspection to the correct DB driver
func IntrospectSQLSchema(dbType, connStr string) ([]map[string]any, error) {
	switch dbType {
	case DBTypeSQLite:
		dbConn, err := db.OpenSQLite(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		return db.GetSQLiteTablesAndColumns(dbConn)
	case DBTypePostgres:
		dbConn, err := db.OpenPostgres(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		return db.GetPostgresTablesAndColumns(dbConn)
	case DBTypeMySQL:
		dbConn, err := db.OpenMySQL(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		return db.GetMySQLTablesAndColumns(dbConn)
	default:
		return nil, ErrUnsupportedDBType
	}
}

// ExtractSQLDBInfo extracts host, port, and database name from the connection string
func ExtractSQLDBInfo(dbType, connStr string) (host string, port int, database string, err error) {
	switch dbType {
	case DBTypePostgres:
		db.ExtractPostgresInfo(connStr)
	case DBTypeMySQL:
		return db.ExtractMySQLInfo(connStr)
	case DBTypeSQLite:
		database = db.ExtractSQLiteFile(connStr)
		return "", 0, database, nil
	default:
		return "", 0, "", ErrUnsupportedDBType
	}
	return
}

// FetchAllRecords fetches all rows from a table. Returns []map[string]interface{}.
func FetchAllRecords(dbConn *sql.DB, tableName string) ([]map[string]interface{}, error) {
	query := fmt.Sprintf("SELECT * FROM %s", tableName)
	rows, err := dbConn.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	var results []map[string]interface{}
	for rows.Next() {
		vals := make([]interface{}, len(cols))
		valPtrs := make([]interface{}, len(cols))
		for i := range vals {
			valPtrs[i] = &vals[i]
		}
		if err := rows.Scan(valPtrs...); err != nil {
			return nil, err
		}
		rowMap := make(map[string]interface{})
		for i, col := range cols {
			var v interface{}
			if b, ok := vals[i].([]byte); ok {
				v = string(b)
			} else {
				v = vals[i]
			}
			rowMap[col] = v
		}
		results = append(results, rowMap)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return results, nil
}


// SQLGetAllRecords fetches all records from a SQL table as []map[string]interface{}.
// Requires dbType, connStr, tableName, and rowCount (limit). Returns []map[string]interface{}.
func SQLGetAllRecords(dbType, connStr, tableName string, rowCount int) ([]map[string]any, error) {
	switch dbType {
	case DBTypePostgres:
		dbConn, err := db.OpenPostgres(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		return FetchAllRecords(dbConn, tableName)
	case DBTypeSQLite:
		dbConn, err := db.OpenSQLite(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		return FetchAllRecords(dbConn, tableName)
	case DBTypeMySQL:
		dbConn, err := db.OpenMySQL(connStr)
		if err != nil {
			return nil, err
		}
		defer dbConn.Close()
		return FetchAllRecords(dbConn, tableName)
	default:
		return nil, ErrUnsupportedDBType
	}
}
