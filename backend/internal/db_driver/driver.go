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

func PingDB(dbCfg *config.DBConfig, conn *schema.ConnectionRequest) error {

	if conn.ManualConn == nil {
		pool, err := NewDBPool(dbCfg, conn.StringConn.ConnString, conn.StringConn.DBType)
		if err != nil {
			return err
		}

		switch conn.StringConn.DBType {
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
        	return errors.New("unsupported database type: " + conn.StringConn.DBType)
    	}
	}

	connStr, err := CreateConnectionString(conn.ManualConn)
	if err != nil {
		return err
	}

	pool, err := NewDBPool(dbCfg, connStr, conn.ManualConn.DBType)
	if err != nil {
		return err
	}

	switch conn.StringConn.DBType {
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
        return errors.New("unsupported database type: " + conn.StringConn.DBType)
    }
}