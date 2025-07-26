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
	response.JSON(ctx, http.StatusOK, "Connection successful", nil)

}

func (h *Handler) HandleCreateConnection(ctx *gin.Context) {
	var req schema.ConnectionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "Invalid request data", err)
		return
	}

	exists, err := connections.CheckConnectionExists(h.Cfg.DBClient, &req)
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
		UserID:         req.UserID,
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

    connections, err := connections.GetConnectionsByUserID(h.Cfg.DBClient, userID)
    if err != nil {
        response.InternalError(ctx, err)
        return
    }

    if len(connections) == 0 {
        response.NotFound(ctx, "No connections found for user")
        return
    }

    response.JSON(ctx, http.StatusOK, "User connections", connections)
}