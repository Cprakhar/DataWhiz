package handlers

import (
	"datawhiz/internal/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func MeHandler(c *gin.Context) {
	header := c.GetHeader("Authorization")
	tokenStr := ""
	if len(header) > 7 && header[:7] == "Bearer " {
		tokenStr = header[7:]
	}
	parsed, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return middleware.JwtSecret, nil
	})
	if err != nil || !parsed.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}
	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user_id": claims["user_id"], "email": claims["email"]})
}
