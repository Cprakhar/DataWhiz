package handlers

import (
	"net/http"
	"time"

	"datawhiz/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type RefreshRequest struct {
	Token string `json:"token" binding:"required"`
}

func RefreshHandler(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	parsed, err := jwt.Parse(req.Token, func(token *jwt.Token) (interface{}, error) {
		return middleware.JwtSecret, nil
	})
	if err != nil || !parsed.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}
	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok || claims["user_id"] == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
		return
	}
	// Issue new token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": claims["user_id"],
		"email":   claims["email"],
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(middleware.JwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}
