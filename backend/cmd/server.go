package main

import (
	"datawhiz/internal/db"
	"datawhiz/internal/handlers"
	"datawhiz/internal/middleware"

	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env for local development
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("No .env file found or error loading .env")
	}

	db.InitDB("datawhiz.db")

	r := gin.Default()
	r.Use(middleware.SlogLogger())
	r.Use(middleware.ErrorHandler())

	r.GET("/health", handlers.HealthCheckHandler)
	r.POST("/auth/register", handlers.RegisterHandler)
	r.POST("/auth/login", handlers.LoginHandler)
	r.POST("/auth/refresh", handlers.RefreshHandler)
	r.POST("/auth/logout", handlers.LogoutHandler)

	handlers.SetupOAuthRoutes(r)

	// Protected routes group
	protected := r.Group("/api")
	protected.Use(middleware.AuthRequired())
	{
		protected.GET("/me", handlers.MeHandler)

		// Database Connection Management endpoints (protected)
		protected.POST("/db/connect", handlers.ConnectDBHandler)
		protected.GET("/db/list", handlers.ListConnectionsHandler)
		protected.DELETE("/db/disconnect/:connection_id", handlers.DisconnectDBHandler)
		protected.GET("/db/schema/:connection_id", handlers.SchemaIntrospectionHandler)
		protected.POST("/query/execute", handlers.ExecuteQueryHandler)
		protected.POST("/query/generate", handlers.GenerateQueryHandler)
		protected.GET("/history/:user_id", handlers.QueryHistoryHandler)
	}

	r.Run()
}
