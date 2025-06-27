package middleware

import (
	"github.com/gin-gonic/gin"
	"golang.org/x/exp/slog"
)

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if rec := recover(); rec != nil {
				slog.Error("panic recovered", "error", rec)
				c.AbortWithStatusJSON(500, gin.H{"error": "Internal server error"})
			}
		}()
		c.Next()
		if len(c.Errors) > 0 {
			for _, e := range c.Errors {
				slog.Error("handler error", "error", e.Error())
			}
			c.JSON(-1, gin.H{"error": c.Errors[0].Error()})
		}
	}
}
