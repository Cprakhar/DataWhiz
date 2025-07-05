package main

import (
	"datawhiz/internal/db"
	"datawhiz/internal/handlers"
	"datawhiz/internal/middleware"

	"github.com/gin-contrib/cors"

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
	db.SetEncryptionKeyFromEnv()

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

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
		protected.POST("/db/test", handlers.TestDBHandler)
		protected.GET("/db/list", handlers.ListConnectionsHandler)
		protected.DELETE("/db/disconnect/:connection_id", handlers.DisconnectDBHandler)
		protected.GET("/db/schema/:connection_id", handlers.SchemaIntrospectionHandler)
		// Table and record endpoints
		protected.GET("/db/:connection_id/tables", handlers.GetTablesHandler)
		protected.GET("/db/:connection_id/table/:table_name/records", handlers.GetTableRecordsHandler)
		protected.POST("/query/execute", handlers.ExecuteQueryHandler)
		protected.POST("/query/generate", handlers.GenerateQueryHandler)
		protected.GET("/history/:user_id", handlers.QueryHistoryHandler)
	}

	r.Run()
}
