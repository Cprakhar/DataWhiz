package router

import (
	"time"

	"github.com/cprakhar/datawhiz/config"
	"github.com/cprakhar/datawhiz/internal/handlers"
	"github.com/cprakhar/datawhiz/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func NewRouter(cfg *config.Config) *gin.Engine {
	router := gin.Default()

	store := cookie.NewStore([]byte(cfg.Env.SessionSecret))
	store.Options(sessions.Options{
		Path: "/",
		MaxAge: int(cfg.Env.SessionMaxAge),
		HttpOnly: true,
		Secure: cfg.Env.SessionSecure,
	})

	cors := cors.New(cors.Config{
		AllowOrigins:     []string{cfg.Env.FrontendBaseURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH","DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})

	router.Use(sessions.Sessions("datawhiz_session", store))
	router.Use(cors)

	h := &handlers.Handler{Cfg: cfg}

	h.InitProviders()

	api := router.Group("/api/v1")
	api.GET("/health", h.HandleHealthCheck)
	api.POST("/auth/register", h.HandleRegister)
	api.GET("/auth/oauth/signin", h.HandleOAuthSignIn)
	api.GET("/auth/oauth/callback", h.HandleOAuthCallback)
	api.POST("/auth/login", h.HandleLogin)
	api.POST("/auth/logout", middleware.RequireAuth(), h.HandleLogout)
	api.GET("/auth/me", middleware.RequireAuth(), h.HandleMe)
	api.POST("/connections", middleware.RequireAuth(), h.HandleCreateConnection)
	api.GET("/connections", middleware.RequireAuth(), h.HandleGetConnections)
	api.POST("/connections/ping", middleware.RequireAuth(), h.HandlePingConnection)

	return router
}