package main

import (
	"context"
	"encoding/base64"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cprakhar/datawhiz/config"
	poolmanager "github.com/cprakhar/datawhiz/internal/pool_manager"
	"github.com/cprakhar/datawhiz/internal/router"
)

func main() {
	// Initialize the configuration
	config, err := config.NewConfig()
	if err != nil {
		panic(err) // Handle error appropriately in production code
	}

	encryptionKey, err := base64.StdEncoding.DecodeString(config.Env.EncryptionKey)
	if err != nil {
		panic("Invalid encryption key: " + err.Error())
	}
	if len(encryptionKey) != 32 {
		panic("Encryption key must be 32 bytes long")
	}

	config.Env.EncryptionKey = string(encryptionKey)
	

	poolmanager.StartCleanupRoutine(config.Env.CleanupInterval, config.DBClient)
	
	server := router.NewRouter(config)
	srv := &http.Server{
		Addr:   ":" + config.Env.Port, // Use the port from the configuration
		Handler: server,
	}


	println("Starting server on port " + config.Env.Port)
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			panic("Failed to start server: " + err.Error())
		}

	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		panic("Server forced to shutdown: " + err.Error())
	}

	poolmanager.ShutdownAllPools(config.DBClient)

	println("Server gracefully stopped")
}
