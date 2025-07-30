package handlers

import (
	"net/http"

	dbdriver "github.com/cprakhar/datawhiz/internal/db_driver"
	poolmanager "github.com/cprakhar/datawhiz/internal/pool_manager"
	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func (h *Handler) HandleGetTables(ctx *gin.Context) {

	session := sessions.Default(ctx)
	userID := session.Get("user_id")
	if userID == nil {
		response.Unauthorized(ctx, "Authentication required")
		return
	}

	connID := ctx.Param("id")
	if connID == "" {
		response.BadRequest(ctx, "Connection ID is required", nil)
		return
	}

	poolMgr, err := poolmanager.GetPool(connID)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	
	tables, err := dbdriver.ExtractDBTables(poolMgr.Pool, poolMgr.DBType)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	response.JSON(ctx, http.StatusOK, "Tables retrieved successfully", tables)
}