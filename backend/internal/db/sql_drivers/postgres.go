package sql_drivers

import (
	"database/sql"
	"datawhiz/internal/models"
	"net/url"
	"regexp"
	"strconv"
	"strings"
)

// ValidatePostgres validates a PostgreSQL connection string by opening and pinging the DB
func ValidatePostgres(connStr string) error {
	dbConn, err := OpenPostgres(connStr)
	if err != nil {
		return err
	}
	defer dbConn.Close()
	return dbConn.Ping()
}

// OpenPostgres opens a PostgreSQL database connection using pgx driver
func OpenPostgres(connStr string) (*sql.DB, error) {
	return sql.Open("pgx", connStr)
}

// GetPostgresTableMetadata returns column metadata for a given table
func GetPostgresTableMetadata(dbConn *sql.DB, tableName string) ([]models.ColumnMeta, error) {
	columns := []models.ColumnMeta{}

	colQuery := `SELECT column_name, data_type, is_nullable, column_default
			   FROM information_schema.columns WHERE table_name = $1`
	rows, err := dbConn.Query(colQuery, tableName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var col models.ColumnMeta
		var nullable string
		err := rows.Scan(&col.Name, &col.DataType, &nullable, &col.Default)
		if err != nil {
			return nil, err
		}
		col.Nullable = (nullable == "YES")
		columns = append(columns, col)
	}

	// Get Unique Keys
	uniqueQuery := `SELECT kcu.column_name
				FROM information_schema.table_constraints tc
				JOIN information_schema.key_column_usage kcu
				  ON tc.constraint_name = kcu.constraint_name
				  AND tc.table_schema = kcu.table_schema
				WHERE tc.constraint_type = 'UNIQUE' AND tc.table_name = $1;`
	uniqueRows, err := dbConn.Query(uniqueQuery, tableName)
	uniqueCols := map[string]bool{}
	if err == nil {
		defer uniqueRows.Close()
		for uniqueRows.Next() {
			var uqCol string
			uniqueRows.Scan(&uqCol)
			uniqueCols[uqCol] = true
		}
	}
	for i := range columns {
		if uniqueCols[columns[i].Name] {
			columns[i].UniqueKey = true
		}
	}

	// Get Primary Key
	pKQuery := `SELECT a.attname FROM pg_index i JOIN pg_attribute a 
			   ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
			   WHERE i.indrelid = $1::regclass AND i.indisprimary;`
	pKRows, err := dbConn.Query(pKQuery, tableName)
	if err != nil {
		return nil, err
	}
	defer pKRows.Close()

	pKCols := map[string]bool{}
	for pKRows.Next() {
		var pkCol string
		pKRows.Scan(&pkCol)
		pKCols[pkCol] = true
	}
	for i := range columns {
		if pKCols[columns[i].Name] {
			columns[i].PrimaryKey = true
		}
	}

	// Get Foreign Keys
	fkQuery := `SELECT kcu.column_name
			   FROM information_schema.table_constraints tc
			   JOIN information_schema.key_column_usage kcu
				 ON tc.constraint_name = kcu.constraint_name
				 AND tc.table_schema = kcu.table_schema
			   WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1;`
	fkRows, err := dbConn.Query(fkQuery, tableName)
	if err != nil {
		return nil, err
	}
	defer fkRows.Close()

	fkCols := map[string]bool{}
	for fkRows.Next() {
		var fkCol string
		fkRows.Scan(&fkCol)
		fkCols[fkCol] = true
	}
	for i := range columns {
		if fkCols[columns[i].Name] {
			columns[i].ForeignKey = true
		}
	}

	return columns, nil
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
		colMeta, err := GetPostgresTableMetadata(dbConn, tableName)
		if err != nil {
			continue
		}
		tables = append(tables, map[string]interface{}{"name": tableName, "columns": colMeta})
	}
	return tables, nil
}

// Extract host, port, and database name for Postgres connection string
func ExtractPostgresInfo(connStr string) (host string, port int, database string, err error) {
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
