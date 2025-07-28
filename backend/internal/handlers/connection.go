package handlers

import (
	"net/http"

	"github.com/cprakhar/datawhiz/internal/database/connections"
	"github.com/cprakhar/datawhiz/internal/database/schema"
	dbdriver "github.com/cprakhar/datawhiz/internal/db_driver"
	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/cprakhar/datawhiz/utils/secure"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func (h *Handler) HandlePingConnection(ctx *gin.Context) {
	var req schema.ConnectionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "Invalid request data", err)
		return
	}

	if err := dbdriver.PingDB(h.Cfg.DBConfig, &req); err != nil {
		response.InternalError(ctx, err)
		return
	}
	response.JSON(ctx, http.StatusOK, "Connection verified!", nil)

}

func (h *Handler) HandleCreateConnection(ctx *gin.Context) {
	session := sessions.Default(ctx)
	userID := session.Get("user_id")
	if userID == nil {
		response.Unauthorized(ctx, "Authentication required")
		return
	}


	var req schema.ConnectionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "Invalid request data", err)
		return
	}

	exists, err := connections.CheckConnectionExists(h.Cfg.DBClient, &req, userID.(string))
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	if exists {
		response.BadRequest(ctx, "Connection already exists for this user", err)
		return
	}

	encryptedPassword, err := secure.Encrypt(req.Password, h.Cfg.Env.EncryptionKey)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	newConn := &schema.Connection{
		UserID:         userID.(string),
		Port:           req.Port,
		Host:           req.Host,
		Username:       req.Username,
		Password:       encryptedPassword,
		DBType:         req.DBType,
		ConnectionName: req.ConnectionName,
		SSLMode:        req.SSLMode,
		DBName:         req.DBName,
	}

	createdConn, err := connections.InsertOneConnection(h.Cfg.DBClient, newConn)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	response.JSON(ctx, http.StatusCreated, "Connection created successfully", createdConn)
}

func (h *Handler) HandleGetConnections(ctx *gin.Context) {
    session := sessions.Default(ctx)
    userID := session.Get("user_id").(string) // Safe: middleware guarantees presence

    conns, err := connections.GetConnectionsByUserID(h.Cfg.DBClient, userID)
    if err != nil {
        response.InternalError(ctx, err)
        return
    }

	if conns == nil {
		conns = []connections.ResponseConnection{}
	}

    response.JSON(ctx, http.StatusOK, "User connections", conns)
}

func (h *Handler) HandleDeleteConnection(ctx *gin.Context) {
	session := sessions.Default(ctx)
	userID := session.Get("user_id").(string)
	if userID == "" {
		response.Unauthorized(ctx, "Authentication required")
		return
	}

	connID := ctx.Param("id")
	if connID == "" {
		response.BadRequest(ctx, "Connection ID is required", nil)
		return
	}
	err := connections.DeleteConnection(h.Cfg.DBClient, connID, userID)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	response.OK(ctx, "Connection deleted successfully")
}