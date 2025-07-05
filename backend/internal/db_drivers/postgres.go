package db_drivers

import (
	"database/sql"
	"net/url"
	"regexp"
	"strconv"
	"strings"
)

// OpenPostgres opens a PostgreSQL database connection using pgx driver
func OpenPostgres(connStr string) (*sql.DB, error) {
	return sql.Open("pgx", connStr)
}

// GetPostgresTablesAndColumns returns a list of tables and their columns for a PostgreSQL database
func GetPostgresTablesAndColumns(dbConn *sql.DB) ([]map[string]interface{}, error) {
	tables := []map[string]interface{}{}
	rows, err := dbConn.Query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			continue
		}
		colRows, err := dbConn.Query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", tableName)
		if err != nil {
			continue
		}
		cols := []string{}
		for colRows.Next() {
			var colName string
			colRows.Scan(&colName)
			cols = append(cols, colName)
		}
		tables = append(tables, map[string]interface{}{"name": tableName, "columns": cols})
	}
	return tables, nil
}

// ValidatePostgres validates a PostgreSQL connection string by opening and pinging the DB
func ValidatePostgres(connStr string) error {
	normalized := connStr
	if len(connStr) >= 13 && connStr[:13] == "postgresql://" {
		normalized = "postgres://" + connStr[13:]
	}
	dbConn, err := OpenPostgres(normalized)
	if err != nil {
		return err
	}
	defer dbConn.Close()
	return dbConn.Ping()
}

// Extract host, port, and database name for Postgres connection string
func ExtractPostgresInfo(connStr string) (host string, port int, database string) {
	if strings.HasPrefix(connStr, "postgres://") || strings.HasPrefix(connStr, "postgresql://") {
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
		reHost := regexp.MustCompile(`host=([^\s]+)`)
		rePort := regexp.MustCompile(`port=([0-9]+)`)
		reDB := regexp.MustCompile(`dbname=([^\s]+)`)
		if m := reHost.FindStringSubmatch(connStr); len(m) > 1 {
			host = m[1]
		}
		if m := rePort.FindStringSubmatch(connStr); len(m) > 1 {
			port, _ = strconv.Atoi(m[1])
		}
		if m := reDB.FindStringSubmatch(connStr); len(m) > 1 {
			database = m[1]
		}
	}
	return
}
