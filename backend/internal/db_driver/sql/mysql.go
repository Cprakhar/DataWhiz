package sql

import (
	"context"
	"database/sql"
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
