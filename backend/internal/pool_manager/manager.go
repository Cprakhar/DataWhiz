package poolmanager

import (
	"context"
	"database/sql"
	"errors"
	"sync"
	"time"

	"github.com/cprakhar/datawhiz/config"
	"github.com/cprakhar/datawhiz/internal/database/connections"
	dbdriver "github.com/cprakhar/datawhiz/internal/db_driver"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type PoolManager struct {
	Pool      interface{} // This can be a *pgxpool.Pool, *sql.DB, *mongo.Client, etc.
	ExpiresAt time.Time
	UserID    string
	DBType    string
}

var (
	poolMap   = make(map[string]*PoolManager) // key: connection ID
	poolMutex sync.RWMutex                    // Mutex to protect access to poolMap
)

// GetPool retrieves the connection pool for the given connection ID.
func GetPool(connID string) (*PoolManager, error) {
	poolMutex.RLock()
	defer poolMutex.RUnlock()

	if pool, exists := poolMap[connID]; exists && time.Now().Before(pool.ExpiresAt) {
		return pool, nil
	}
	return nil, errors.New("connection pool not found or expired")
}

// ActivateConnection activates a connection pool for the given connection ID.
func ActivateConnection(cfg *config.Config, connID, dbType, userID string) error {
	poolMutex.Lock()
	pool, exists := poolMap[connID]
	poolMutex.Unlock()
	if exists && time.Now().Before(pool.ExpiresAt) {
		return nil
	}

	connString, err := connections.GetConnectionStringByID(cfg.DBClient, connID, userID)
	if err != nil {
		return err
	}
	if connString == "" {
		return errors.New("connection string not found for connection ID: " + connID)
	}

	newPool, err := dbdriver.NewDBPool(cfg.DBConfig, connString, dbType)
	if err != nil {
		return err
	}
	poolMutex.Lock()
	poolMap[connID] = &PoolManager{
		Pool:      newPool,
		ExpiresAt: time.Now().Add(1 * time.Hour),
		UserID:    userID,
		DBType:    dbType,
	}
	poolMutex.Unlock()
	return nil
}

// StartCleanupRoutine starts a background goroutine to periodically clean up expired pools.
func StartCleanupRoutine(interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			<-ticker.C
			CleanupPools()
		}
	}()
}

// DeactivateConnection deactivates the connection pool for the given connection ID.
func DeactivateConnection(connID string) error {
	poolMutex.Lock()
	defer poolMutex.Unlock()
	if pool, exists := poolMap[connID]; exists {
		switch p := pool.Pool.(type) {
		case *pgxpool.Pool:
			p.Close()
		case *sql.DB:
			p.Close()
		case *mongo.Client:
			p.Disconnect(context.Background())
		default:
			return errors.New("unsupported pool type")
		}
		delete(poolMap, connID)
	}

	return nil
}

// CleanupPools cleans up expired connection pools.
func CleanupPools() {
	poolMutex.Lock()
	defer poolMutex.Unlock()
	for connID, pool := range poolMap {
		if time.Now().After(pool.ExpiresAt) {
			switch p := pool.Pool.(type) {
			case *pgxpool.Pool:
				p.Close()
			case *sql.DB:
				p.Close()
			case *mongo.Client:
				p.Disconnect(context.Background())
			}
			delete(poolMap, connID)
		}
	}
}
