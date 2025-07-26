package response

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Standard response structure
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

// Success with data
func JSON(c *gin.Context, status int, message string, data interface{}) {
	c.JSON(status, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Success without data
func OK(c *gin.Context, message string) {
	JSON(c, http.StatusOK, message, nil)
}

// Error response
func Error(c *gin.Context, status int, errMessage string, errDetail interface{}) {
	var errStr string
	switch e := errDetail.(type) {
	case error:
		errStr = e.Error()
	case string:
		errStr = e
	case nil:
		errStr = ""
	default:
		errStr = fmt.Sprintf("%v", e)
	}
	c.JSON(status, Response{
		Success: false,
		Message: errMessage,
		Error:   errStr,
	})
}

// 400 Bad Request
func BadRequest(c *gin.Context, msg string, err interface{}) {
	Error(c, http.StatusBadRequest, msg, err)
}

// 401 Unauthorized
func Unauthorized(c *gin.Context, msg string) {
	Error(c, http.StatusUnauthorized, msg, nil)
	c.Abort()
}

// 500 Internal Server Error
func InternalError(c *gin.Context, err interface{}) {
	Error(c, http.StatusInternalServerError, "Something went wrong", err)
}

// 404 Not Found
func NotFound(c *gin.Context, msg string) {
    Error(c, http.StatusNotFound, msg, nil)
}