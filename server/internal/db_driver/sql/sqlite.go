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
func NewSQLitePool(dbCfg *config.DBConfig, filePath string) (*sql.DB, error) {

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

// CreateSQLiteConnectionString constructs a SQLite connection string from the provided connection form.
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

// GetSQLiteTableSchema retrieves the schema of a specific table in the SQLite database.
func GetSQLiteTableSchema(db *sql.DB, tableName string) ([]schema.ColumnSchema, error) {
	var columns []schema.ColumnSchema

	// 1. Query all columns (pk and notnull as int)
	query := "PRAGMA table_info(" + tableName + ")"
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// 2. Get FKs
	fkQuery := "PRAGMA foreign_key_list(" + tableName + ")"
	fkRows, err := db.Query(fkQuery)
	if err != nil {
		return nil, err
	}
	defer fkRows.Close()
	fkSet := make(map[string]struct {
		Table  string
		Column string
	})
	for fkRows.Next() {
		var id, seq int
		var table, from, to, onUpdate, onDelete, match string
		if err := fkRows.Scan(&id, &seq, &table, &from, &to, &onUpdate, &onDelete, &match); err != nil {
			return nil, err
		}
		fkSet[from] = struct {
			Table  string
			Column string
		}{Table: table, Column: to}
	}

	// 3. Get indexes and unique constraints
	idxListQuery := "PRAGMA index_list('" + tableName + "')"
	idxListRows, err := db.Query(idxListQuery)
	if err != nil {
		return nil, err
	}
	defer idxListRows.Close()
	// indexName -> isUnique, origin
	type idxMeta struct {
		Unique bool
		Origin string
	}
	idxMetaMap := make(map[string]idxMeta)
	colToIndexes := make(map[string][]string)
	uniqueCols := make(map[string]struct{})
	for idxListRows.Next() {
		var seq int
		var indexName, origin string
		var unique, partial int
		if err := idxListRows.Scan(&seq, &indexName, &unique, &origin, &partial); err != nil {
			return nil, err
		}
		idxMetaMap[indexName] = idxMeta{Unique: unique == 1, Origin: origin}

		// For each index, get columns
		idxInfoQuery := "PRAGMA index_info('" + indexName + "')"
		idxInfoRows, err := db.Query(idxInfoQuery)
		if err != nil {
			return nil, err
		}
		for idxInfoRows.Next() {
			var seqno, cid int
			var colName string
			if err := idxInfoRows.Scan(&seqno, &cid, &colName); err != nil {
				idxInfoRows.Close()
				return nil, err
			}
			colToIndexes[colName] = append(colToIndexes[colName], indexName)
			// Mark as unique if index is unique and origin is 'u' (unique constraint)
			if unique == 1 && origin == "u" {
				uniqueCols[colName] = struct{}{}
			}
		}
		idxInfoRows.Close()
	}

	// 4. Build columns
	for rows.Next() {
		var cid, notnull, pk int
		var name, ctype string
		var dfltValue sql.NullString
		if err := rows.Scan(&cid, &name, &ctype, &notnull, &dfltValue, &pk); err != nil {
			return nil, err
		}
		column := schema.ColumnSchema{
			Name:         name,
			Type:         ctype,
			IsNullable:   notnull == 0,
			DefaultValue: dfltValue,
			IsPrimaryKey: pk > 0,
		}
		if fkInfo, ok := fkSet[name]; ok {
			column.IsForeignKey = true
			column.ForeignKeyTable = fkInfo.Table
			column.ForeignKeyColumn = fkInfo.Column
		}
		if _, ok := uniqueCols[name]; ok {
			column.IsUnique = true
		}
		if idxs, ok := colToIndexes[name]; ok {
			column.Indexes = idxs
		}
		columns = append(columns, column)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return columns, nil
}

// GetSQLiteTableRecords retrieves the records of a specific table in the SQLite database.
func GetSQLiteTableRecords(db *sql.DB, tableName string) ([]map[string]interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := db.QueryContext(ctx, "SELECT * FROM "+tableName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}
	var records []map[string]interface{}
	for rows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range columns {
			valuePtrs[i] = &values[i]
		}
		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, err
		}

		record := make(map[string]interface{})
		for i, colName := range columns {
			val := values[i]
			if val == nil {
				record[colName] = nil
			} else {
				record[colName] = val
			}
		}
		records = append(records, record)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return records, nil
}

// RunSQLiteQuery executes a query on the SQLite database and returns the results.
func RunSQLiteQuery(db *sql.DB, query string) (interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	var results []map[string]interface{}
	for rows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range columns {
			valuePtrs[i] = &values[i]
		}
		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, err
		}

		result := make(map[string]interface{})
		for i, colName := range columns {
			val := values[i]
			if val == nil {
				result[colName] = nil
			} else {
				result[colName] = val
			}
		}
		results = append(results, result)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return results, nil
}