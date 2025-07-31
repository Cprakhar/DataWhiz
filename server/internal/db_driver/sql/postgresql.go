package sql

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/cprakhar/datawhiz/config"
	"github.com/cprakhar/datawhiz/internal/database/schema"
	"github.com/cprakhar/datawhiz/utils/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PingPostgres pings the PostgreSQL database to check if it's reachable.
func PingPostgres(pool *pgxpool.Pool) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	conn, err := pool.Acquire(ctx)
	if err != nil {
		return err
	}
	defer conn.Release()

	if err := conn.Conn().Ping(ctx); err != nil {
		return err
	}
	return nil
}

// NewPostgresClient creates a new PostgreSQL client with the provided connection string.
func NewPostgresPool(dbCfg *config.DBConfig, connStr string) (*pgxpool.Pool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	poolConfig, err := pgxpool.ParseConfig(connStr)
	if err != nil {
		return nil, err
	}

	poolConfig.MaxConns = int32(dbCfg.MaxOpenConns)
	poolConfig.MaxConnIdleTime = dbCfg.ConnMaxIdleTime

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, err
	}

	if err := PingPostgres(pool); err != nil {
		pool.Close()
		return nil, err
	}

	return pool, nil
}

// CreatePostgresConnectionString constructs a PostgreSQL connection string from the provided connection form.
func CreatePostgresConnectionString(conn *schema.ManualConnectionForm) (string, error) {
	if conn.Host == "" {
		conn.Host = "localhost"
	}
	if conn.Port == "" {
		conn.Port = "5432"
	}

	sslMode := "disable"
	if conn.SSLMode {
		sslMode = "require"
	}

	return "postgres://" + conn.Username + ":" + conn.Password + "@" + conn.Host + ":" +
		conn.Port + "/" + conn.DBName + "?sslmode=" + sslMode, nil
}

// ExtractPostgresDetails extracts the connection details from a PostgreSQL connection string.
func ExtractPostgresDetails(conn *schema.StringConnectionForm) (*schema.ManualConnectionForm, error) {
	// Assuming the connection string is in the format:
	// postgres://username:password@host:port/dbname?sslmode=mode

	parts := strings.SplitN(conn.ConnString, "://", 2)
	if len(parts) != 2 {
		return nil, errors.New("invalid connection string format")
	}

	connDetails := &schema.ManualConnectionForm{
		DBType:   conn.DBType,
		ConnName: conn.ConnName,
	}

	// Parse the connection string to extract details
	connStrParts := strings.SplitN(parts[1], "@", 2)
	if len(connStrParts) != 2 {
		return nil, errors.New("invalid connection string format")
	}

	userPass := strings.SplitN(connStrParts[0], ":", 2)
	if len(userPass) != 2 {
		return nil, errors.New("invalid user:password format")
	}
	connDetails.Username = userPass[0]
	connDetails.Password = userPass[1]

	hostPortDB := strings.SplitN(connStrParts[1], "/", 2)
	if len(hostPortDB) != 2 {
		return nil, errors.New("invalid host:port/dbname format")
	}

	hostPort := strings.SplitN(hostPortDB[0], ":", 2)
	if len(hostPort) == 2 {
		connDetails.Host = hostPort[0]
		connDetails.Port = hostPort[1]
	} else {
		connDetails.Host = hostPort[0]
		connDetails.Port = "5432" // Default PostgreSQL port
	}

	connDetails.DBName = hostPortDB[1]
	connDetails.SSLMode = false // default

	for param := range strings.SplitSeq(parts[1], "&") {
		if after, ok := strings.CutPrefix(param, "sslmode="); ok {
			connDetails.SSLMode = (after == "require")
			break
		}
	}

	return connDetails, nil
}

// GetPostgresTables retrieves the list of tables in the PostgreSQL database.
func GetPostgresTables(pool *pgxpool.Pool) ([]string, error) {
	rows, err := pool.Query(context.Background(),
		"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
	)
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

// GetPostgresTableSchema retrieves the schema of a specific table in the PostgreSQL database.
func GetPostgresTableSchema(pool *pgxpool.Pool, tableName string) ([]schema.ColumnSchema, error) {
	var columns []schema.ColumnSchema

	// 1. Get all columns
	rows, err := pool.Query(context.Background(),
		"SELECT column_name, data_type, is_nullable, column_default "+
			"FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1", tableName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// 2. Get PKs
	pkRows, err := pool.Query(context.Background(),
		"SELECT kcu.column_name FROM information_schema.table_constraints tc "+
			"JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name "+
			"WHERE tc.table_schema = 'public' AND tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY'", tableName)
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

	// 3. Get Uniques
	uniqueRows, err := pool.Query(context.Background(),
		"SELECT kcu.column_name FROM information_schema.table_constraints tc "+
			"JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name "+
			"WHERE tc.table_schema = 'public' AND tc.table_name = $1 AND tc.constraint_type = 'UNIQUE'", tableName)
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

	// 4. Get FKs
	fkRows, err := pool.Query(context.Background(),
		"SELECT kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column "+
			"FROM information_schema.table_constraints tc "+
			"JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name "+
			"JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name "+
			"WHERE tc.table_schema = 'public' AND tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY'", tableName)
	if err != nil {
		return nil, err
	}
	defer fkRows.Close()
	fkMap := make(map[string]struct {
		Table  string
		Column string
	})
	for fkRows.Next() {
		var fkCol, foreignTable, foreignColumn string
		if err := fkRows.Scan(&fkCol, &foreignTable, &foreignColumn); err != nil {
			return nil, err
		}
		fkMap[fkCol] = struct {
			Table  string
			Column string
		}{foreignTable, foreignColumn}
	}

	// 5. Get Indexes (column_name, index_name)
	indexRows, err := pool.Query(context.Background(),
		`SELECT a.attname AS column_name, i.relname AS index_name
				FROM pg_class t, pg_class i, pg_index ix, pg_attribute a
				WHERE t.oid = ix.indrelid
				  AND i.oid = ix.indexrelid
				  AND a.attrelid = t.oid
				  AND a.attnum = ANY(ix.indkey)
				  AND t.relkind = 'r'
				  AND t.relname = $1`, tableName)
	if err != nil {
		return nil, err
	}
	defer indexRows.Close()
	indexMap := make(map[string][]string) // column_name -> []index_name
	for indexRows.Next() {
		var colName, idxName string
		if err := indexRows.Scan(&colName, &idxName); err != nil {
			return nil, err
		}
		indexMap[colName] = append(indexMap[colName], idxName)
	}

	// 6. Build columns
	for rows.Next() {
		var col schema.ColumnSchema
		var isNullable string
		if err := rows.Scan(&col.Name, &col.Type, &isNullable, &col.DefaultValue); err != nil {
			return nil, err
		}
		col.IsNullable = (isNullable == "YES")
		if _, ok := pkSet[col.Name]; ok {
			col.IsPrimaryKey = true
		}
		if _, ok := uniqueSet[col.Name]; ok {
			col.IsUnique = true
		}
		if fk, ok := fkMap[col.Name]; ok {
			col.IsForeignKey = true
			col.ForeignKeyTable = fk.Table
			col.ForeignKeyColumn = fk.Column
		}
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

// GetPostgresTableRecords retrieves the records of a specific table in the PostgreSQL database.
func GetPostgresTableRecords(pool *pgxpool.Pool, tableName string) ([]map[string]interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, "SELECT * FROM "+tableName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns := rows.FieldDescriptions()
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
		for i, col := range columns {
			record[string(col.Name)] = uuid.ConvertUUIDifPossible(values[i])
		}
		records = append(records, record)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return records, nil
}

// RunPostgresQuery executes a raw SQL query on the PostgreSQL database and returns the results.
func RunPostgresQuery(pool *pgxpool.Pool, query string) (interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns := rows.FieldDescriptions()
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
		for i, col := range columns {
			result[string(col.Name)] = uuid.ConvertUUIDifPossible(values[i])
		}
		results = append(results, result)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return results, nil
}