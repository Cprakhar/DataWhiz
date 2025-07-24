package handlers

import (
	"github.com/cprakhar/datawhiz/config"
	"github.com/gin-gonic/gin"
)


func HandleHealthCheck(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Here you can add logic to check the health of your application
		// For example, checking database connectivity, etc.
		
		c.JSON(200, gin.H{
			"message": "Health check successful",
			"status": "healthy",
		})
	}
}