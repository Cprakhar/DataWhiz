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
	// Capitalize initial letter of email and set name as everything before '@' with capital initial
	localPart := strings.SplitN(req.Email, "@", 2)[0]
	user := models.User{
		Email:        strings.ToLower(req.Email),
		PasswordHash: string(hash),
		Name:         localPart,
		CreatedAt:    time.Now(),
	}
	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
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
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(middleware.JwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	// Set JWT as httpOnly cookie
	c.SetCookie(
		"token",
		tokenString,
		60*60*24, // 1 day
		"/",
		"localhost", // Change to your domain in production
		false,       // Set to true if using HTTPS
		true,        // httpOnly
	)
	c.JSON(http.StatusOK, gin.H{"user_id": user.ID})
}

func LogoutHandler(c *gin.Context) {
	// Clear the JWT cookie
	c.SetCookie(
		"token",
		"",
		-1, // Expire immediately
		"/",
		"localhost", // Change to your domain in production
		false,       // Set to true if using HTTPS
		true,        // httpOnly
	)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
