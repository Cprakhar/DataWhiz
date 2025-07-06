package sql_drivers

import (
	"database/sql"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"datawhiz/internal/models"
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

	// Collect unique columns
	uniqueCols := map[string]bool{}
	idxRows, err := dbConn.Query("SHOW INDEX FROM " + tableName)
	if err == nil {
		defer idxRows.Close()
		for idxRows.Next() {
			var (
				table, nonUnique, keyName, seqInIndex, colName, collation, cardinality, subPart, packed, null, indexType, comment, indexComment sql.NullString
			)
			// SHOW INDEX: Table, Non_unique, Key_name, Seq_in_index, Column_name, Collation, Cardinality, Sub_part, Packed, Null, Index_type, Comment, Index_comment
			err := idxRows.Scan(&table, &nonUnique, &keyName, &seqInIndex, &colName, &collation, &cardinality, &subPart, &packed, &null, &indexType, &comment, &indexComment)
			if err == nil && nonUnique.String == "0" {
				uniqueCols[colName.String] = true
			}
		}
	}

	// Collect primary key columns
	pkCols := map[string]bool{}
	pkRows, err := dbConn.Query("SHOW KEYS FROM " + tableName + " WHERE Key_name = 'PRIMARY'")
	if err == nil {
		defer pkRows.Close()
		for pkRows.Next() {
			var (
				table, nonUnique, keyName, seqInIndex, colName, collation, cardinality, subPart, packed, null, indexType, comment, indexComment sql.NullString
			)
			err := pkRows.Scan(&table, &nonUnique, &keyName, &seqInIndex, &colName, &collation, &cardinality, &subPart, &packed, &null, &indexType, &comment, &indexComment)
			if err == nil {
				pkCols[colName.String] = true
			}
		}
	}

	// Collect foreign key columns
	fkCols := map[string]bool{}
	fkRows, err := dbConn.Query("SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL", tableName)
	if err == nil {
		defer fkRows.Close()
		for fkRows.Next() {
			var fkCol string
			if err := fkRows.Scan(&fkCol); err == nil {
				fkCols[fkCol] = true
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
