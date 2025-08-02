package dbdriver

import (
	"context"
	"database/sql"
	"errors"

	"github.com/cprakhar/datawhiz/config"
	"github.com/cprakhar/datawhiz/internal/database/schema"
	"github.com/cprakhar/datawhiz/internal/db_driver/nosql"
	sql_ "github.com/cprakhar/datawhiz/internal/db_driver/sql"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// CreateConnectionString constructs a database connection string based on the provided connection form.
func CreateConnectionString(conn *schema.ManualConnectionForm) (string, error) {
	switch conn.DBType {
	case "postgresql":
		return sql_.CreatePostgresConnectionString(conn)
	case "mysql":
		return sql_.CreateMySQLConnectionString(conn)
	case "sqlite":
		return sql_.CreateSQLiteConnectionString(conn)
	case "mongodb":
		return nosql.CreateMongoDBConnectionString(conn)
	default:
		return "", errors.New("unsupported database type: " + conn.DBType)
	}
}

// NewDBPool creates a new database connection pool based on the provided configuration and connection string.
func NewDBPool(dbCfg *config.DBConfig, connStr, dbType string) (interface{}, error) {
	switch dbType {
	case "postgresql":
		return sql_.NewPostgresPool(dbCfg, connStr)
	case "mysql":
		return sql_.NewMySQLPool(dbCfg, connStr)
	case "sqlite":
		return sql_.NewSQLitePool(dbCfg, connStr)
	case "mongodb":
		return nosql.NewMongoDBPool(dbCfg, connStr)
	default:
		return nil, errors.New("unsupported database type: " + dbType)
	}
}

// PingDB checks the connectivity to the database by pinging it.
func PingDB(dbCfg *config.DBConfig, connString, dbType string) error {

	pool, err := NewDBPool(dbCfg, connString, dbType)
	if err != nil {
		return err
	}

	switch dbType {
    case "postgresql":
        pgPool := pool.(*pgxpool.Pool)
        defer pgPool.Close()
        return sql_.PingPostgres(pgPool)
    case "mysql":
        sqlPool := pool.(*sql.DB)
        defer sqlPool.Close()
        return sql_.PingMySQL(sqlPool)
    case "sqlite":
        sqlPool := pool.(*sql.DB)
        defer sqlPool.Close()
        return sql_.PingSQLite(sqlPool)
    case "mongodb":
        mongoClient := pool.(*mongo.Client)
        defer mongoClient.Disconnect(context.Background())
        return nosql.PingMongoDB(mongoClient)
    default:
        return errors.New("unsupported database type: " + dbType)
    }
}

// ExtractDBDetails extracts the connection details from a database connection string.
func ExtractDBDetails(conn *schema.StringConnectionForm) (*schema.ManualConnectionForm, error) {
	switch conn.DBType {
	case "postgresql":
		return sql_.ExtractPostgresDetails(conn)
	case "mysql":
		return sql_.ExtractMySQLDetails(conn)
	case "mongodb":
		return nosql.ExtractMongoDBDetails(conn)
	default:
		return nil, errors.New("unsupported database type: " + conn.DBType)
	}
}

// ExtractDBTables extracts the list of tables or collections from the database.
func ExtractDBTables(pool interface{}, dbType string, dbName ...string) (interface{}, error) {
	switch dbType {
	case "postgresql":
		return sql_.GetPostgresTables(pool.(*pgxpool.Pool))
	case "mysql":
		return sql_.GetMySQLTables(pool.(*sql.DB))
	case "sqlite":
		return sql_.GetSQLiteTables(pool.(*sql.DB))
	case "mongodb":
		return nosql.GetMongoDBCollections(pool.(*mongo.Client), dbName[0])
	default:
		return nil, errors.New("unsupported database type: " + dbType)
	}
}

// GetTableSchema retrieves the schema of a specific table or collection in the database.
func GetTableSchema(pool interface{}, dbType, dbName, tableName string) (interface{}, error) {
	switch dbType {
	case "postgresql":
		return sql_.GetPostgresTableSchema(pool.(*pgxpool.Pool), tableName)
	case "mysql":
		return sql_.GetMySQLTableSchema(pool.(*sql.DB), tableName)
	case "sqlite":
		return sql_.GetSQLiteTableSchema(pool.(*sql.DB), tableName)
	default:
		return nil, errors.New("unsupported database type: " + dbType)
	}
}

// GetTableRecords retrieves the records of a specific table or collection in the database.
func GetTableRecords(pool interface{}, dbType, dbName, tableName string) (interface{}, error) {
	switch dbType {
	case "postgresql":
		return sql_.GetPostgresTableRecords(pool.(*pgxpool.Pool), tableName)
	case "mysql":
		return sql_.GetMySQLTableRecords(pool.(*sql.DB), tableName)
	case "sqlite":
		return sql_.GetSQLiteTableRecords(pool.(*sql.DB), tableName)
	case "mongodb":
		return nosql.GetMongoDBCollectionRecords(pool.(*mongo.Client), dbName, tableName)
	default:
		return nil, errors.New("unsupported database type: " + dbType)
	}
}

// RunQuery executes a query on the database and returns the result.
func RunQuery(pool interface{}, dbType, dbName, query string) (interface{}, error) {
	switch dbType {
	case "postgresql":
		return sql_.RunPostgresQuery(pool.(*pgxpool.Pool), query)
	case "mysql":
		return sql_.RunMySQLQuery(pool.(*sql.DB), query)
	case "sqlite":
		return sql_.RunSQLiteQuery(pool.(*sql.DB), query)
	// case "mongodb":
	// 	return nosql.RunMongoDBQuery(pool.(*mongo.Client), dbName, tableName, query)
	default:
		return nil, errors.New("unsupported database type: " + dbType)
	}
}

// GetReleventTablesSchema retrieves the schema of relevant tables in the database.
func GetReleventTablesSchema(pool interface{}, dbType string, tables []string) (map[string][]schema.ColumnSchema, error) {
	result := make(map[string][]schema.ColumnSchema)
	for _, table := range tables {
		rawSchema, err := GetTableSchema(pool, dbType, "", table)
		if err != nil {
			return nil, err
		}
		if columns, ok := rawSchema.([]schema.ColumnSchema); ok {
			result[table] = columns
		} else {
			return nil, errors.New("invalid schema format for table: " + table)
		}

		var filtered []schema.ColumnSchema
		for _, col := range result[table] {
			filtered = append(filtered, schema.ColumnSchema{
				Name:             col.Name,
				Type:             col.Type,
				IsPrimaryKey: 	col.IsPrimaryKey,
				IsForeignKey: 	col.IsForeignKey,
				ForeignKeyTable: col.ForeignKeyTable,
				ForeignKeyColumn: col.ForeignKeyColumn,
			})
		}
		result[table] = filtered
	}
	return result, nil
}