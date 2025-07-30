package sql

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/cprakhar/datawhiz/config"
	"github.com/cprakhar/datawhiz/internal/database/schema"
	_ "github.com/go-sql-driver/mysql"
)

// PingMySQL pings the MySQL database to check if it's reachable.
func PingMySQL(pool *sql.DB) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := pool.PingContext(ctx); err != nil {
		return err
	}
	return nil
}

// NewMySQLClient creates a new MySQL pool with the provided connection string.
func NewMySQLPool(dbCfg *config.DBConfig, connStr string) (*sql.DB, error) {
	pool, err := sql.Open("mysql", connStr)
	if err != nil {
		return nil, err
	}

	// Configure connection pool settings
	pool.SetMaxOpenConns(dbCfg.MaxOpenConns)
	pool.SetMaxIdleConns(dbCfg.MaxIdleConns)
	pool.SetConnMaxLifetime(dbCfg.ConnMaxLifetime)
	pool.SetConnMaxIdleTime(dbCfg.ConnMaxIdleTime)

	if err := PingMySQL(pool); err != nil {
		pool.Close()
		return nil, err
	}
	return pool, nil
}

func CreateMySQLConnectionString(conn *schema.ManualConnectionForm) (string, error) {
	if conn.Host == "" {
		conn.Host = "localhost"
	}
	if conn.Port == "" {
		conn.Port = "3306" // Default MySQL port
	}

	// Construct the connection string
	connStr := conn.Username + ":" + conn.Password + "@tcp(" + conn.Host + ":" + conn.Port + ")/" + conn.DBName

	if conn.SSLMode {
		connStr += "?tls=true"
	} else {
		connStr += "?tls=skip-verify"
	}

	return connStr, nil
}

func ExtractMySQLDetails(conn *schema.StringConnectionForm) (*schema.ManualConnectionForm, error) {

	//Assuming the connection string is in the format:
	// "scheme://user:password@tcp(host:port)/dbname?tls=true"

	parts := strings.SplitN(conn.ConnString, "://", 2)
	if len(parts) != 2 {
		return nil, errors.New("invalid MySQL connection string format")
	}

	connStrParts := strings.SplitN(parts[1], "@", 2)
	if len(connStrParts) != 2 {
		return nil, errors.New("invalid MySQL connection string format")
	}

	userPass := strings.SplitN(connStrParts[0], ":", 2)
	if len(userPass) != 2 {
		return nil, errors.New("invalid MySQL connection string format")
	}

	// Split host/dbname and query params
	hostDbAndParams := strings.SplitN(connStrParts[1], "?", 2)
	hostDb := hostDbAndParams[0]
	var query string
	if len(hostDbAndParams) == 2 {
		query = hostDbAndParams[1]
	}

	// hostDb: tcp(host:port)/dbname
	hostDbParts := strings.SplitN(hostDb, "/", 2)
	if len(hostDbParts) != 2 {
		return nil, errors.New("invalid MySQL connection string format")
	}

	// Remove tcp(...) wrapper
	hostPort := hostDbParts[0]
	hostPort = strings.TrimPrefix(hostPort, "tcp(")
	hostPort = strings.TrimSuffix(hostPort, ")")
	hostPortParts := strings.SplitN(hostPort, ":", 2)
	host := hostPortParts[0]
	port := "3306"
	if len(hostPortParts) == 2 {
		port = hostPortParts[1]
	}

	dbName := hostDbParts[1]

	connDetails := &schema.ManualConnectionForm{
		DBType:   conn.DBType,
		ConnName: conn.ConnName,
		Username: userPass[0],
		Password: userPass[1],
		Host:     host,
		Port:     port,
		DBName:   dbName,
		SSLMode:  false, // default
	}

	// Parse query params for tls
	if query != "" {
		for param := range strings.SplitSeq(query, "&") {
			if after, ok := strings.CutPrefix(param, "tls="); ok {
				connDetails.SSLMode = (after == "true")
				break
			}
		}
	}

	return connDetails, nil
}

// GetMySQLTables retrieves the list of tables in the MySQL database.
func GetMySQLTables(pool *sql.DB) ([]string, error) {
	rows, err := pool.Query("SHOW TABLES")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			return nil, err
		}
		tables = append(tables, tableName)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tables, nil
}