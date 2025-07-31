package middleware

import (
	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// RequireAuth is a middleware that checks if the user is authenticated by verifying the session.
func RequireAuth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		session := sessions.Default(ctx)
		userID := session.Get("user_id")
		if userID == nil {
			response.Unauthorized(ctx, "Authentication required")
			return
		}
		ctx.Next()
	}
}