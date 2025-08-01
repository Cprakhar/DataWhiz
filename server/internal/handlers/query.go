package handlers

import (
	"log"
	"net/http"
	"time"

	queryhistory "github.com/cprakhar/datawhiz/internal/database/query_history"
	dbdriver "github.com/cprakhar/datawhiz/internal/db_driver"
	poolmanager "github.com/cprakhar/datawhiz/internal/pool_manager"
	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/gin-gonic/gin"
)

type RequestExecuteQuery struct {
	Query string `json:"query"`
	GeneratedQuery string `json:"generated_query"`
}

type ResponseQueryResult struct {
	Result interface{} `json:"result"`
	ExecutedAt time.Time `json:"executed_at"`
	Duration int64 `json:"duration"`
}

// HandleExecuteQuery executes a SQL query on the specified connection and returns the results.
func (h *Handler) HandleExecuteQuery(ctx *gin.Context) {

	var req RequestExecuteQuery
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
	
	executedAt := time.Now()
	results, err := dbdriver.RunQuery(poolMgr.Pool, poolMgr.DBType, dbName, req.GeneratedQuery)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	if results == nil {
		results = []interface{}{}
	}
	endTime := time.Now()
	duration := endTime.Sub(executedAt).Milliseconds()

	queryResult := &ResponseQueryResult{
		Result: results,
		ExecutedAt: executedAt,
		Duration: duration,
	}

	err = queryhistory.SaveQueryHistory(h.Cfg.DBClient, &queryhistory.QueryHistory{
		UserID: poolMgr.UserID,
		ConnectionID: connID,
		Query: req.Query,
		GeneratedQuery: req.GeneratedQuery,
		ExecutedAt: executedAt,
		Duration: duration,
	})
	if err != nil {
		log.Println("Error saving query history:", err)
		response.InternalError(ctx, err)
		return
	}

	response.JSON(ctx, http.StatusOK, "Query executed successfully", queryResult)
}

func (h *Handler) HandleGetQueryHistory(ctx *gin.Context) {
	connID := ctx.Param("id")
	if connID == "" {
		response.BadRequest(ctx, "Connection ID is required", nil)
		return
	}

	histories, err := queryhistory.GetQueryHistoryByConnectionID(h.Cfg.DBClient, connID)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	response.JSON(ctx, http.StatusOK, "Query history retrieved successfully", histories)
}	