package sql

import (
	"context"
	"database/sql"
	"time"

	"github.com/cprakhar/datawhiz/config"
	"github.com/cprakhar/datawhiz/internal/database/schema"
	_ "github.com/mattn/go-sqlite3"
)

// PingSQLite pings the SQLite database to check if it's reachable.
func PingSQLite(pool *sql.DB) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := pool.PingContext(ctx); err != nil {
		return err
	}
	return nil
}

// NewSQLitePool creates a new SQLite pool with the provided file path.
func NewSQLitePool(dbCfg *config.DBConfig, filePath string) (*sql.DB, error){
	
	dsn := "file:" + filePath + "?cache=shared&mode=ro&_journal_mode=WAL&_sync=FULL"
	pool, err := sql.Open("sqlite3", dsn)
	if err != nil {
		return nil, err
	}

	pool.SetMaxIdleConns(dbCfg.MaxIdleConns)
	pool.SetMaxOpenConns(dbCfg.MaxOpenConns)
	pool.SetConnMaxLifetime(dbCfg.ConnMaxLifetime)
	pool.SetConnMaxIdleTime(dbCfg.ConnMaxIdleTime)

	if err := PingSQLite(pool); err != nil {
		pool.Close()
		return nil, err
	}

	return pool, nil
}

func CreateSQLiteConnectionString(conn *schema.ConnectionRequest) (string, error) {
	// Construct the connection string
	connStr := "file:" + conn.DBName + "?cache=shared&mode=ro&_journal_mode=WAL&_sync=FULL"

	if conn.SSLMode == "require" {
		connStr += "&sslmode=require"
	} else {
		connStr += "&sslmode=disable"
	}

	return connStr, nil
}