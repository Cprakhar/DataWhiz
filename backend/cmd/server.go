package main

import (
	"encoding/base64"

	"github.com/cprakhar/datawhiz/config"
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
	
	server := router.NewRouter(config)
	server.Run(":" + config.Env.Port) // Use the port from the configuration
}
