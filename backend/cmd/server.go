package main

import (
	"github.com/cprakhar/datawhiz/config"
	"github.com/cprakhar/datawhiz/internal/router"
)

func main() {
	// Initialize the configuration
	config, err := config.NewConfig()
	if err != nil {
		panic(err) // Handle error appropriately in production code
	}

	server := router.NewRouter(config)
	server.Run(":" + config.Env.Port) // Use the port from the configuration
}
