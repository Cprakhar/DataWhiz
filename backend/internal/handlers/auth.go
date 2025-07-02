package handlers

import (
	"net/http"
	"strings"
	"time"

	"datawhiz/internal/db"
	"datawhiz/internal/middleware"
	"datawhiz/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func RegisterHandler(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := db.DB.Where("email = ?", req.Email).First(&models.User{}).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Email:        strings.ToLower(req.Email),
		PasswordHash: string(hash),
		Name:         strings.TrimSpace(req.Name),
		AvatarURL:    "/user-default.svg",
		CreatedAt:    time.Now(),
	}
	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}
	// After registration, do NOT log in the user automatically. Just return user info (no cookie).
	c.JSON(http.StatusOK, gin.H{
		"user_id":    user.ID,
		"avatar_url": user.AvatarURL,
		"name":       user.Name,
	})
}

func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var user models.User
	if err := db.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(7 * 24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(middleware.JwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	// Set JWT as httpOnly cookie
	http.SetCookie(c.Writer, &http.Cookie{
    Name:     "token",
    Value:    tokenString,
    Path:     "/",
    Domain:   "", // Use current domain for dev/prod flexibility
    HttpOnly: true,
    Secure:   false,                // Set to true if using HTTPS
    SameSite: http.SameSiteLaxMode, // Lax is safe for most auth flows
    MaxAge:   60 * 60 * 24 * 7,     // 7 day
	})
	c.JSON(http.StatusOK, gin.H{
		"user_id":    user.ID,
		"avatar_url": user.AvatarURL,
		"name":       user.Name,
	})
}

func LogoutHandler(c *gin.Context) {
	// Clear the JWT cookie
	c.SetCookie(
		"token",
		"",
		-1, // Expire immediately
		"/",
		"",    // Change to your domain in production
		false, // Set to true if using HTTPS
		true,  // httpOnly
	)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
