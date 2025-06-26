package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// HealthCheckHandler returns 200 OK for health checks
func HealthCheckHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
