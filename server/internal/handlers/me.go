package handlers

import (
	"net/http"

	"github.com/cprakhar/datawhiz/internal/database/users"
	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func (h *Handler) HandleMe(ctx *gin.Context) {
	session := sessions.Default(ctx)
	userID := session.Get("user_id")
	if userID == nil {
		response.Unauthorized(ctx, "Authentication required")
		return
	}
	// DBClient is available as h.Cfg.DBClient
	userInfo, err := users.GetUserByID(h.Cfg.DBClient, userID.(string))
	if err != nil || userInfo == nil {
		response.InternalError(ctx, err)
		return
	}
	response.JSON(ctx, http.StatusOK, "User info", userInfo)
}
