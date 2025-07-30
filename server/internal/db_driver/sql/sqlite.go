package sql

import (
	"context"
	"database/sql"
	"errors"
	"path/filepath"
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
	
	dsn := "file:" + filePath + "?cache=shared&mode=rwc&_journal_mode=WAL&_sync=FULL"
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

func CreateSQLiteConnectionString(conn *schema.ManualConnectionForm) (string, error) {
	if conn.DBFilePath == "" {
		return "", errors.New("SQLite connection requires a file path")
	}
	if !filepath.IsAbs(conn.DBFilePath) {
		return "", errors.New("SQLite file path must be absolute")
	}

	return conn.DBFilePath, nil
}


// ExtractSQLiteDBName extracts the database name from the SQLite file path.
func ExtractSQLiteDBName(filePath string) string {

	if filePath != "" {
		// Extract the file name without extension
		fileName := filepath.Base(filePath)
		dbName := fileName[:len(fileName)-len(filepath.Ext(fileName))]
		return dbName
	}
	return ""
}

// GetSQLiteTables retrieves the list of tables in the SQLite database.
func GetSQLiteTables(db *sql.DB) ([]string, error) {
	rows, err := db.Query("SELECT name FROM sqlite_master WHERE type='table'")
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