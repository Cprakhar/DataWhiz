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

// HandleGenerateQuery handles the generation of a SQL query based on a natural language input.
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
	
	tables, err := llm.GetTableNamesFromQuery(req.Query)
	if err != nil {
		response.BadRequest(ctx, "Invalid query format", err)
		return
	}

	poolMgr, err := poolmanager.GetPool(connID)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	releventSchemas, err := dbdriver.GetReleventTablesSchema(poolMgr.Pool, poolMgr.DBType, tables)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	systemPrompt, err := llm.ConstructPromptSQL(releventSchemas, tables, poolMgr.DBType)
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