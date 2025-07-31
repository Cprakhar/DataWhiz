package handlers

import (
	"net/http"

	dbdriver "github.com/cprakhar/datawhiz/internal/db_driver"
	poolmanager "github.com/cprakhar/datawhiz/internal/pool_manager"
	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/gin-gonic/gin"
)

// HandleExecuteQuery executes a SQL query on the specified connection and returns the results.
func (h *Handler) HandleExecuteQuery(ctx *gin.Context) {
	var req RequestQuery
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "Invalid request data", err)
		return
	}

	connID := ctx.Param("id")
	if connID == "" {
		response.BadRequest(ctx, "Connection ID is required", nil)
		return
	}

	dbName := ctx.Query("db_name")
	poolMgr, err := poolmanager.GetPool(connID)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	results, err := dbdriver.RunQuery(poolMgr.Pool, poolMgr.DBType, dbName, req.Query)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	response.JSON(ctx, http.StatusOK, "Query executed successfully", results)
}