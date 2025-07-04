package utils

import (
	"net/url"
	"regexp"
	"strconv"
	"strings"
)

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

// Extract database name for MongoDB connection string
func ExtractMongoDBName(connStr string) string {
	u, err := url.Parse(connStr)
	if err == nil {
		dbName := strings.TrimPrefix(u.Path, "/")
		if dbName != "" {
			return dbName
		}
	}
	return "test"
}
