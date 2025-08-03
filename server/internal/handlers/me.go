package handlers

import (
	"net/http"

	"github.com/cprakhar/datawhiz/internal/database/users"
	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/gin-gonic/gin"
)

// HandleMe retrieves the current user's information based on the session.
func (h *Handler) HandleMe(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		response.Unauthorized(ctx, "User not authenticated")
		return
	}

	userInfo, err := users.GetUserByID(h.Cfg.DBClient, userID.(string))
	if err != nil || userInfo == nil {
		response.InternalError(ctx, err)
		return
	}
	response.JSON(ctx, http.StatusOK, "User info", userInfo)
}
