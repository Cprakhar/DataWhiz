package handlers

import (
	"net/http"

	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func (h *Handler) HandleMe (ctx *gin.Context) {
	session := sessions.Default(ctx)
	userID := session.Get("user_id")
	email := session.Get("user_email")
	if userID == nil || email == nil {
		response.Unauthorized(ctx, "Authentication required")
		return
	}
	response.JSON(ctx, http.StatusOK, "User session data", map[string]interface{}{
		"user_id": userID,
		"email":   email,
	})
}