package db_drivers

import (
	"database/sql"
	"strconv"
	"strings"
	"net/url"
	"regexp"
)

// OpenMySQL opens a MySQL database connection
func OpenMySQL(connStr string) (*sql.DB, error) {
	return sql.Open("mysql", connStr)
}

// GetMySQLTablesAndColumns returns a list of tables and their columns for a MySQL database
func GetMySQLTablesAndColumns(dbConn *sql.DB) ([]map[string]interface{}, error) {
	tables := []map[string]interface{}{}
	rows, err := dbConn.Query("SHOW TABLES")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			continue
		}
		colRows, err := dbConn.Query("SHOW COLUMNS FROM " + tableName)
		if err != nil {
			continue
		}
		cols := []string{}
		for colRows.Next() {
			var colName string
			// The first column in SHOW COLUMNS is the column name
			colRows.Scan(&colName)
			cols = append(cols, colName)
		}
		tables = append(tables, map[string]interface{}{"name": tableName, "columns": cols})
	}
	return tables, nil
}


// ValidateMySQL validates a MySQL connection string by opening and pinging the DB
func ValidateMySQL(connStr string) error {
	dbConn, err := OpenMySQL(connStr)
	if err != nil {
		return err
	}
	defer dbConn.Close()
	return dbConn.Ping()
}

// Extract host, port, and database name for MySQL connection string
func ExtractMySQLInfo(connStr string) (host string, port int, database string) {
	if strings.HasPrefix(connStr, "mysql://") {
		u, err := url.Parse(connStr)
		if err == nil {
			host = u.Hostname()
			portStr := u.Port()
			if portStr != "" {
				port, _ = strconv.Atoi(portStr)
			}
			database = strings.TrimPrefix(u.Path, "/")
		}
	} else {
		re := regexp.MustCompile(`@tcp\(([^:]+)(?::([0-9]+))?\)/([^?]+)`)
		m := re.FindStringSubmatch(connStr)
		if len(m) > 0 {
			host = m[1]
			if m[2] != "" {
				port, _ = strconv.Atoi(m[2])
			}
			database = m[3]
		}
	}
	return
}
