package db_drivers

import (
	"database/sql"
	"strings"
)

// ValidateSQLite validates a SQLite connection string by opening and pinging the DB
func ValidateSQLite(connStr string) error {
	dbConn, err := OpenSQLite(connStr)
	if err != nil {
		return err
	}
	defer dbConn.Close()
	return dbConn.Ping()
}

// OpenSQLite opens a SQLite database connection
func OpenSQLite(connStr string) (*sql.DB, error) {
	return sql.Open("sqlite3", connStr)
}

// GetSQLiteTablesAndColumns returns a list of tables and their columns for a SQLite database
func GetSQLiteTablesAndColumns(dbConn *sql.DB) ([]map[string]interface{}, error) {
	tables := []map[string]interface{}{}
	rows, err := dbConn.Query("SELECT name FROM sqlite_master WHERE type='table'")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			continue
		}
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
	return tables, nil
}

// Extract database name from SQLite file path (e.g. /path/to/mydb.db -> mydb)
func ExtractSQLiteFile(connStr string) string {
	var path string
	if strings.HasPrefix(connStr, "file:") {
		path = strings.TrimPrefix(connStr, "file:")
	} else {
		path = connStr
	}
	// Remove query params if present
	if idx := strings.Index(path, "?"); idx != -1 {
		path = path[:idx]
	}
	// Remove trailing slash if any
	path = strings.TrimRight(path, "/")
	// Extract file name
	lastSlash := strings.LastIndex(path, "/")
	fileName := path
	if lastSlash != -1 {
		fileName = path[lastSlash+1:]
	}
	// Remove extension if present
	dot := strings.LastIndex(fileName, ".")
	if dot > 0 {
		return fileName[:dot]
	}
	return fileName
}
