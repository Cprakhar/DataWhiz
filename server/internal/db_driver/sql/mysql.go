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

// CreateMySQLConnectionString constructs a MySQL connection string from the provided connection form.
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

// ExtractMySQLDetails extracts the connection details from a MySQL connection string.
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

// GetMySQLTableSchema retrieves the schema of a specific table in the MySQL database.
func GetMySQLTableSchema(pool *sql.DB, tableName string) ([]schema.ColumnSchema, error) {
	var columns []schema.ColumnSchema

	//1. Query all columns
	query := "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns " +
		"WHERE table_schema = DATABASE() AND table_name = ?"
	rows, err := pool.Query(query, tableName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	//2. Get PKs
	pkQuery := "SELECT kcu.column_name FROM information_schema.table_constraints tc " +
		"JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name " +
		"WHERE tc.table_schema = DATABASE() AND tc.table_name = ? AND tc.constraint_type = 'PRIMARY KEY'"
	pkRows, err := pool.Query(pkQuery, tableName)
	if err != nil {
		return nil, err
	}
	defer pkRows.Close()
	pkSet := make(map[string]struct{})
	for pkRows.Next() {
		var pkCol string
		if err := pkRows.Scan(&pkCol); err != nil {
			return nil, err
		}
		pkSet[pkCol] = struct{}{}
	}

	//3. Get FKs
	fkQuery := "SELECT kcu.column_name, kcu.referenced_table_name, kcu.referenced_column_name " +
		"FROM information_schema.table_constraints tc " +
		"JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name " +
		"WHERE tc.table_schema = DATABASE() AND tc.table_name = ? AND tc.constraint_type = 'FOREIGN KEY'"
	fkRows, err := pool.Query(fkQuery, tableName)
	if err != nil {
		return nil, err
	}
	defer fkRows.Close()
	fkMap := make(map[string]struct {
		Table  string
		Column string
	})
	for fkRows.Next() {
		var fkCol, fkTable, fkColumn string
		if err := fkRows.Scan(&fkCol, &fkTable, &fkColumn); err != nil {
			return nil, err
		}
		fkMap[fkCol] = struct {
			Table  string
			Column string
		}{Table: fkTable, Column: fkColumn}
	}

	//4. Get Uniques
	uniqueQuery := "SELECT kcu.column_name FROM information_schema.table_constraints tc " +
		"JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name " +
		"WHERE tc.table_schema = DATABASE() AND tc.table_name = ? AND tc.constraint_type = 'UNIQUE'"
	uniqueRows, err := pool.Query(uniqueQuery, tableName)
	if err != nil {
		return nil, err
	}
	defer uniqueRows.Close()
	uniqueSet := make(map[string]struct{})
	for uniqueRows.Next() {
		var uniqueCol string
		if err := uniqueRows.Scan(&uniqueCol); err != nil {
			return nil, err
		}
		uniqueSet[uniqueCol] = struct{}{}
	}

	//5. Get Indexes (column_name, index_name)
	indexQuery := "SELECT column_name, index_name FROM information_schema.statistics " +
		"WHERE table_schema = DATABASE() AND table_name = ?"
	indexRows, err := pool.Query(indexQuery, tableName)
	if err != nil {
		return nil, err
	}
	defer indexRows.Close()
	indexMap := make(map[string][]string)
	for indexRows.Next() {
		var colName, indexName string
		if err := indexRows.Scan(&colName, &indexName); err != nil {
			return nil, err
		}
		indexMap[colName] = append(indexMap[colName], indexName)
	}

	//6. Build columns
	for rows.Next() {
		var name, typ, isNullableStr string
		var defaultValue sql.NullString
		if err := rows.Scan(&name, &typ, &isNullableStr, &defaultValue); err != nil {
			return nil, err
		}
		col := schema.ColumnSchema{
			Name:         name,
			Type:         typ,
			IsNullable:   isNullableStr == "YES",
			DefaultValue: defaultValue,
		}
		// Set primary key flag
		if _, ok := pkSet[col.Name]; ok {
			col.IsPrimaryKey = true
		}
		// Set foreign key details
		if fk, ok := fkMap[col.Name]; ok {
			col.IsForeignKey = true
			col.ForeignKeyTable = fk.Table
			col.ForeignKeyColumn = fk.Column
		}
		// Set unique flag
		if _, ok := uniqueSet[col.Name]; ok {
			col.IsUnique = true
		}
		// Set indexes
		if idxs, ok := indexMap[col.Name]; ok {
			col.Indexes = idxs
		}
		columns = append(columns, col)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return columns, nil
}

// GetMySQLTableRecords retrieves the records of a specific table in the MySQL database.
func GetMySQLTableRecords(pool *sql.DB, tableName string) ([]map[string]interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := "SELECT * FROM " + tableName
	rows, err := pool.QueryContext(ctx, query)
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

// RunMySQLQuery executes a query on the MySQL database and returns the results.
func RunMySQLQuery(pool *sql.DB, query string) (interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := pool.QueryContext(ctx, query)
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