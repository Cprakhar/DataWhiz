package handlers

import (
	db "datawhiz/internal/db"
	"datawhiz/internal/middleware"
	"datawhiz/internal/models"
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
	if tokenStr == "" {
		// Try cookie
		cookie, err := c.Cookie("token")
		if err == nil {
			tokenStr = cookie
		}
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
	userID, ok := claims["user_id"].(float64)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user_id"})
		return
	}
	var user models.User
	if err := db.DB.First(&user, uint(userID)).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	// For now, use email as name, and no avatar field in DB
	c.JSON(http.StatusOK, gin.H{
		"user_id":    user.ID,
		"email":      user.Email,
		"name":       user.Name,
		"provider":   user.OAuthProvider,
		"avatar_url": user.AvatarURL,
	})
}
