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

// GetSQLiteTablesAndColumns returns a list of tables and their full column metadata for a SQLite database
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
		colMeta, err := GetSQLiteTableMetadata(dbConn, tableName)
		if err != nil {
			continue
		}
		tables = append(tables, map[string]interface{}{"name": tableName, "columns": colMeta})
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

// GetSQLiteTableMetadata returns column metadata for a given table
func GetSQLiteTableMetadata(dbConn *sql.DB, tableName string) ([]ColumnMeta, error) {
	columns := []ColumnMeta{}
	// PRAGMA table_info returns: cid, name, type, notnull, dflt_value, pk
	colRows, err := dbConn.Query("PRAGMA table_info(" + tableName + ")")
	if err != nil {
		return nil, err
	}
	defer colRows.Close()

	// Prepare to collect unique columns
	uniqueCols := map[string]bool{}
	// PRAGMA index_list returns all indexes, including unique ones
	idxRows, err := dbConn.Query("PRAGMA index_list(" + tableName + ")")
	if err == nil {
		defer idxRows.Close()
		for idxRows.Next() {
			var idxSeq int
			var idxName string
			var isUnique int
			var origin, partial sql.NullString
			// PRAGMA index_list: seq, name, unique, origin, partial
			err := idxRows.Scan(&idxSeq, &idxName, &isUnique, &origin, &partial)
			if err == nil && isUnique == 1 {
				// For each unique index, get its columns
				idxInfoRows, err := dbConn.Query("PRAGMA index_info(" + idxName + ")")
				if err == nil {
					defer idxInfoRows.Close()
					for idxInfoRows.Next() {
						var seqno, cid int
						var colName string
						err := idxInfoRows.Scan(&seqno, &cid, &colName)
						if err == nil {
							uniqueCols[colName] = true
						}
					}
				}
			}
		}
	}

	for colRows.Next() {
		var cid int
		var name, ctype string
		var notnull, pk int
		var dfltValue sql.NullString
		err := colRows.Scan(&cid, &name, &ctype, &notnull, &dfltValue, &pk)
		if err != nil {
			return nil, err
		}
		col := ColumnMeta{
			Name:       name,
			DataType:   ctype,
			Nullable:   notnull == 0,
			Default:    dfltValue,
			PrimaryKey: pk > 0,
			UniqueKey:  uniqueCols[name],
		}
		columns = append(columns, col)
	}

	// Foreign keys: PRAGMA foreign_key_list(tableName)
	fkRows, err := dbConn.Query("PRAGMA foreign_key_list(" + tableName + ")")
	if err == nil {
		defer fkRows.Close()
		fkCols := map[string]bool{}
		for fkRows.Next() {
			var (
				id, seq                                    int
				table, from, to, onUpdate, onDelete, match string
			)
			err := fkRows.Scan(&id, &seq, &table, &from, &to, &onUpdate, &onDelete, &match)
			if err == nil {
				fkCols[from] = true
			}
		}
		for i := range columns {
			if fkCols[columns[i].Name] {
				columns[i].ForeignKey = true
			}
		}
	}

	return columns, nil
}
