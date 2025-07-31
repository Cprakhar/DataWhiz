package handlers

import (
	"net/http"

	dbdriver "github.com/cprakhar/datawhiz/internal/db_driver"
	"github.com/cprakhar/datawhiz/internal/llm"
	poolmanager "github.com/cprakhar/datawhiz/internal/pool_manager"
	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/gin-gonic/gin"
)

type RequestQuery struct {
	Query string `json:"query"`
}

func (h *Handler) HandleGenerateQuery(ctx *gin.Context) {
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
	
	tableName := ctx.Param("table_name")
	if tableName == "" {
		response.BadRequest(ctx, "Table name is required", nil)
		return
	}

	dbName := ctx.Query("db_name")

	poolMgr, err := poolmanager.GetPool(connID)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	tableSchema, err := dbdriver.GetTableSchema(poolMgr.Pool, poolMgr.DBType, dbName, tableName)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	tables, err := dbdriver.ExtractDBTables(poolMgr.Pool, poolMgr.DBType)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	systemPrompt, err := llm.ConstructPromptSQL(tableSchema, tables, poolMgr.DBType)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	generatedQuery, err := llm.GenerateQuery(systemPrompt, req.Query, h.Cfg.Env.GroqAPIKey, h.Cfg.Env.GroqModel)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	response.JSON(ctx, http.StatusOK, "Generated query", generatedQuery)
}	