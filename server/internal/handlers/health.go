package handlers

import (
	"net/http"

	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/gin-gonic/gin"
)

// HandleHealthCheck checks the health of the server and returns a simple status message.
func (h *Handler) HandleHealthCheck (ctx *gin.Context) {
	response.JSON(ctx, http.StatusOK, "Server is running", nil)
}