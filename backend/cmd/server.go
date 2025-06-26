package main

import (
	"datawhiz/internal/db"
	"datawhiz/internal/handlers"
	"datawhiz/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	db.InitDB("datawhiz.db")

	r := gin.Default()

	r.GET("/health", handlers.HealthCheckHandler)
	r.POST("/auth/register", handlers.RegisterHandler)
	r.POST("/auth/login", handlers.LoginHandler)
	r.POST("/auth/refresh", handlers.RefreshHandler)

	handlers.SetupOAuthRoutes(r)

	// Protected routes group
	protected := r.Group("/api")
	protected.Use(middleware.AuthRequired())
	{
		protected.GET("/me", handlers.MeHandler)
		// Add more protected endpoints here
	}

	r.Run()
}
