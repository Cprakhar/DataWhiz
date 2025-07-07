package sql_drivers

import (
	"database/sql"
	"datawhiz/internal/models"
	"net/url"
	"regexp"
	"strconv"
	"strings"
)

// ValidateMySQL validates a MySQL connection string by opening and pinging the DB
func ValidateMySQL(connStr string) error {
	dbConn, err := OpenMySQL(connStr)
	if err != nil {
		return err
	}
	defer dbConn.Close()
	return dbConn.Ping()
}

// OpenMySQL opens a MySQL database connection
func OpenMySQL(connStr string) (*sql.DB, error) {
	return sql.Open("mysql", connStr)
}

// Extract host, port, and database name for MySQL connection string
func ExtractMySQLInfo(connStr string) (host string, port int, database string, err error) {
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

// GetMySQLTablesAndColumns returns a list of tables and their full column metadata for a MySQL database
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
		colMeta, err := GetMySQLTableMetadata(dbConn, tableName)
		if err != nil {
			continue
		}
		tables = append(tables, map[string]interface{}{"name": tableName, "columns": colMeta})
	}
	return tables, nil
}

// GetMySQLTableMetadata returns column metadata for a given table
func GetMySQLTableMetadata(dbConn *sql.DB, tableName string) ([]models.ColumnMeta, error) {
	columns := []models.ColumnMeta{}
	// SHOW FULL COLUMNS gives: Field, Type, Collation, Null, Key, Default, Extra, Privileges, Comment
	colRows, err := dbConn.Query("SHOW FULL COLUMNS FROM " + tableName)
	if err != nil {
		return nil, err
	}
	defer colRows.Close()

	// Collect primary, unique, and foreign key columns using information_schema
	pkCols := map[string]bool{}
	uniqueCols := map[string]bool{}
	fkCols := map[string]bool{}

	// Primary keys
	pkQuery := `SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'`
	pkRows, err := dbConn.Query(pkQuery, tableName)
	if err == nil {
		defer pkRows.Close()
		for pkRows.Next() {
			var colName string
			if err := pkRows.Scan(&colName); err == nil {
				pkCols[colName] = true
			}
		}
	}

	// Unique keys (excluding PK)
	uqQuery := `SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME != 'PRIMARY' AND CONSTRAINT_NAME IN (SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_TYPE = 'UNIQUE')`
	uqRows, err := dbConn.Query(uqQuery, tableName, tableName)
	if err == nil {
		defer uqRows.Close()
		for uqRows.Next() {
			var colName string
			if err := uqRows.Scan(&colName); err == nil {
				uniqueCols[colName] = true
			}
		}
	}

	// Foreign keys
	fkQuery := `SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`
	fkRows, err := dbConn.Query(fkQuery, tableName)
	if err == nil {
		defer fkRows.Close()
		for fkRows.Next() {
			var colName string
			if err := fkRows.Scan(&colName); err == nil {
				fkCols[colName] = true
			}
		}
	}

	for colRows.Next() {
		var field, ctype, collation, nullStr, key, extra, privileges, comment sql.NullString
		var defaultVal sql.NullString
		// Field, Type, Collation, Null, Key, Default, Extra, Privileges, Comment
		err := colRows.Scan(&field, &ctype, &collation, &nullStr, &key, &defaultVal, &extra, &privileges, &comment)
		if err != nil {
			return nil, err
		}
		col := models.ColumnMeta{
			Name:       field.String,
			DataType:   ctype.String,
			Nullable:   strings.ToUpper(nullStr.String) == "YES",
			Default:    defaultVal,
			PrimaryKey: pkCols[field.String],
			UniqueKey:  uniqueCols[field.String],
			ForeignKey: fkCols[field.String],
		}
		columns = append(columns, col)
	}
	return columns, nil
}
