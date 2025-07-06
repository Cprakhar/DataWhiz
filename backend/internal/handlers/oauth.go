package handlers

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/github"
	"github.com/markbates/goth/providers/google"
	"gorm.io/gorm"

	db "datawhiz/internal/db"
	"datawhiz/internal/middleware"
	"datawhiz/internal/models"
)

func InitOAuth() {
	goth.UseProviders(
		google.New(os.Getenv("GOOGLE_CLIENT_ID"), os.Getenv("GOOGLE_CLIENT_SECRET"), "http://localhost:8080/auth/google/callback"),
		github.New(os.Getenv("GITHUB_CLIENT_ID"), os.Getenv("GITHUB_CLIENT_SECRET"), "http://localhost:8080/auth/github/callback"),
	)
}

func OAuthLoginHandler(provider string) gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Printf("OAuthLoginHandler provider: %s", provider)
		q := c.Request.URL.Query()
		q.Set("provider", provider)
		c.Request.URL.RawQuery = q.Encode()
		gothic.BeginAuthHandler(c.Writer, c.Request)
	}
}

func OAuthCallbackHandler(provider string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userData, err := gothic.CompleteUserAuth(c.Writer, c.Request)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		// Lookup or create user in DB
		email := userData.Email
		var user models.User
		err = db.DB.Where("email = ?", email).First(&user).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				user = models.User{
					Email:         email,
					OAuthProvider: provider,
					Name:          userData.Name,
					AvatarURL:     userData.AvatarURL,
					CreatedAt:     time.Now(),
				}
				db.DB.Create(&user)
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
				return
			}
		} else {
			// Update name/avatar if changed
			user.Name = userData.Name
			user.AvatarURL = userData.AvatarURL
			db.DB.Save(&user)
		}
		// Issue JWT
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
		// Set JWT as httpOnly cookie with SameSite=Lax for cross-origin dev, and domain left empty for current host
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
		// Redirect to dashboard (no token in URL)
		c.Redirect(http.StatusFound, "http://localhost:3000/dashboard")
	}
}

func SetupOAuthRoutes(r *gin.Engine) {
	secret := os.Getenv("SESSION_SECRET")
	store := cookie.NewStore([]byte(secret))
	r.Use(sessions.Sessions("auth-session", store))
	gothic.Store = store
	InitOAuth()

	r.GET("/auth/google", OAuthLoginHandler("google"))
	r.GET("/auth/google/callback", OAuthCallbackHandler("google"))

	r.GET("/auth/github", OAuthLoginHandler("github"))
	r.GET("/auth/github/callback", OAuthCallbackHandler("github"))
}
