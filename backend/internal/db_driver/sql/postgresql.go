package sql

import (
	"context"
	"time"

	"github.com/cprakhar/datawhiz/config"
	"github.com/cprakhar/datawhiz/internal/database/schema"
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