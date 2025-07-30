package sql

import (
	"context"
	"errors"
	"strings"
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
		if after, ok :=strings.CutPrefix(param, "sslmode="); ok  {
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