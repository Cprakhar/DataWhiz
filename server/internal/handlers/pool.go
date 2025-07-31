package handlers

import (
	"github.com/cprakhar/datawhiz/internal/database/connections"
	poolmanager "github.com/cprakhar/datawhiz/internal/pool_manager"
	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// HandleActivateConnection activates a connection by its ID for the authenticated user.
func (h *Handler) HandleActivateConnection(ctx *gin.Context) {
	session := sessions.Default(ctx)
	userID := session.Get("user_id")

	connID := ctx.Param("id")
	if connID == "" {
		response.BadRequest(ctx, "Connection ID is required", nil)
		return
	}

	dbType := ctx.Query("db_type")
	if dbType == "" {
		response.BadRequest(ctx, "Database type is required", nil)
		return
	}
	err := poolmanager.ActivateConnection(h.Cfg, connID, dbType, userID.(string))
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	err = connections.SetConnectionActive(h.Cfg.DBClient, connID, userID.(string), true)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	response.OK(ctx, "Connection activated successfully")
}

// HandleDeactivateConnection deactivates a connection by its ID for the authenticated user.
func (h *Handler) HandleDeactivateConnection(ctx *gin.Context) {
	session := sessions.Default(ctx)
	userID := session.Get("user_id")
	
	connID := ctx.Param("id")
	if connID == "" {
		response.BadRequest(ctx, "Connection ID is required", nil)
		return
	}

	err := poolmanager.DeactivateConnection(connID)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	err = connections.SetConnectionActive(h.Cfg.DBClient, connID, userID.(string), false)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	response.OK(ctx, "Connection deactivated successfully")
}