package middleware

import (
	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/gin-gonic/gin"
	"github.com/markbates/goth/gothic"
)

// RequireAuth is a middleware that checks if the user is authenticated by verifying the session.
func RequireAuth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		session, err := gothic.Store.Get(ctx.Request, gothic.SessionName)
		if err != nil {
			response.InternalError(ctx, err)
			ctx.Abort()
			return
		}
		userID := session.Values["user_id"]
		if userID == nil {
			response.Unauthorized(ctx, "Authentication required")
			ctx.Abort()
			return
		}
		ctx.Set("user_id", userID)
		ctx.Next()
	}
}