package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/exp/slog"
)

var Logger = slog.New(slog.NewJSONHandler(log.Writer(), nil))

func SlogLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		latency := time.Since(start)
		// Mask sensitive headers
		headers := map[string]string{}
		for k, v := range c.Request.Header {
			if k == "Authorization" || k == "X-Api-Key" {
				headers[k] = "[REDACTED]"
			} else {
				headers[k] = v[0]
			}
		}
		Logger.Info("request",
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"latency", latency.String(),
			"ip", c.ClientIP(),
			"headers", headers,
		)
	}
}
