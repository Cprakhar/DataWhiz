package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var JwtSecret = []byte("supersecretkey") // TODO: Load from env

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Try Authorization header first
		header := c.GetHeader("Authorization")
		tokenStr := ""
		if header != "" && strings.HasPrefix(header, "Bearer ") {
			tokenStr = strings.TrimPrefix(header, "Bearer ")
		} else {
			// Fallback to cookie
			cookie, err := c.Cookie("token")
			if err == nil {
				tokenStr = cookie
			}
		}
		if tokenStr == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid token"})
			return
		}
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return JwtSecret, nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}
		c.Next()
	}
}
