package handlers

import (
	"net/http"

	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/gin-gonic/gin"
)


func (h *Handler) HandleHealthCheck (ctx *gin.Context) {
	response.JSON(ctx, http.StatusOK, "Server is running", nil)
}