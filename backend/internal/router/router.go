package router

import (
	"github.com/cprakhar/datawhiz/config"
	"github.com/cprakhar/datawhiz/internal/handlers"
	"github.com/gin-gonic/gin"
)


func NewRouter(cfg *config.Config) *gin.Engine {
	router := gin.Default()

	api := router.Group("/api/v1")
	api.GET("/health", handlers.HandleHealthCheck(cfg))
	api.POST("/auth/register", handlers.HandleRegister(cfg))
	api.POST("/auth/login", handlers.HandleLogin(cfg))

	return router
}