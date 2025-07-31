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

// HandlePingConnection checks the connectivity to a database connection by pinging it.
func (h *Handler) HandlePingConnection(ctx *gin.Context) {
	var req schema.ConnectionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "Invalid request data", err)
		return
	}

	if req.StringConn != nil {
		if err := dbdriver.PingDB(h.Cfg.DBConfig, req.StringConn.ConnString, req.StringConn.DBType); err != nil {
			response.BadRequest(ctx, "Failed to ping connection", err)
			return
		}
	} else if req.ManualConn != nil {
		connString, err := dbdriver.CreateConnectionString(req.ManualConn)
		if err != nil {
			response.InternalError(ctx, err)
			return
		}
		if err := dbdriver.PingDB(h.Cfg.DBConfig, connString, req.ManualConn.DBType); err != nil {
			response.BadRequest(ctx, "Failed to ping connection", err)
			return
		}
	}
	response.OK(ctx, "Connection ping successful")
}

// HandleCreateConnection creates a new database connection based on the provided request.
func (h *Handler) HandleCreateConnection(ctx *gin.Context) {
	session := sessions.Default(ctx)
	userID := session.Get("user_id")

	var req schema.ConnectionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "Invalid request data", err)
		return
	}

	if req.StringConn != nil {
		conn, err := dbdriver.ExtractDBDetails(req.StringConn)
		if err != nil {
			response.BadRequest(ctx, "Invalid connection string", err)
			return
		}

		encryptedPassword, err := secure.Encrypt(conn.Password, h.Cfg.Env.EncryptionKey)
		if err != nil {
			response.InternalError(ctx, err)
			return
		}

		exists, err := connections.CheckConnectionExists(h.Cfg.DBClient, conn, userID.(string))
		if err != nil {
			response.InternalError(ctx, err)
			return
		}
		if exists {
			response.BadRequest(ctx, "Connection already exists", nil)
			return
		}

		encryptedConnString, err := secure.Encrypt(req.StringConn.ConnString, h.Cfg.Env.EncryptionKey)
		if err != nil {
			response.InternalError(ctx, err)
			return
		}

		newConn := &schema.Connection{
			UserID:         userID.(string),
			Port:           conn.Port,
			Host:           conn.Host,
			Username:       conn.Username,
			Password:       encryptedPassword,
			DBType:         conn.DBType,
			ConnectionName: conn.ConnName,
			SSLMode:        conn.SSLMode,
			DBName:         conn.DBName,
			DBFilePath:     conn.DBFilePath,
			ConnString:     encryptedConnString,
		}
		createdConn, err := connections.InsertOneConnection(h.Cfg.DBClient, newConn)
		if err != nil {
			response.InternalError(ctx, err)
			return
		}
		response.JSON(ctx, http.StatusCreated, "Connection created successfully", createdConn)
		return
	} else if req.ManualConn != nil {
		exists, err := connections.CheckConnectionExists(h.Cfg.DBClient, req.ManualConn, userID.(string))
		if err != nil {
			response.InternalError(ctx, err)
			return
		}
		if exists {
			response.BadRequest(ctx, "Connection already exists", nil)
			return
		}

		connString, err := dbdriver.CreateConnectionString(req.ManualConn)
		if err != nil {
			response.InternalError(ctx, err)
			return
		}

		encryptedPassword, err := secure.Encrypt(req.ManualConn.Password, h.Cfg.Env.EncryptionKey)
		if err != nil {
			response.InternalError(ctx, err)
			return
		}

		encryptedConnString, err := secure.Encrypt(connString, h.Cfg.Env.EncryptionKey)
		if err != nil {
			response.InternalError(ctx, err)
			return
		}

		newConn := &schema.Connection{
			UserID:         userID.(string),
			Port:           req.ManualConn.Port,
			Host:           req.ManualConn.Host,
			Username:       req.ManualConn.Username,
			Password:       encryptedPassword,
			DBType:         req.ManualConn.DBType,
			ConnectionName: req.ManualConn.ConnName,
			SSLMode:        req.ManualConn.SSLMode,
			DBName:         req.ManualConn.DBName,
			DBFilePath:     req.ManualConn.DBFilePath,
			ConnString:     encryptedConnString,
		}

		createdConn, err := connections.InsertOneConnection(h.Cfg.DBClient, newConn)
		if err != nil {
			response.InternalError(ctx, err)
			return
		}
		response.JSON(ctx, http.StatusCreated, "Connection created successfully", createdConn)
	}
}

// HandleGetConnections retrieves all connections for the authenticated user.
func (h *Handler) HandleGetConnections(ctx *gin.Context) {
    session := sessions.Default(ctx)
    userID := session.Get("user_id").(string)

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

// HandleDeleteConnection deletes a connection by its ID for the authenticated user.
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

// HandleGetConnection retrieves a specific connection by its ID for the authenticated user.
func (h *Handler) HandleGetConnection(ctx *gin.Context) {
	session := sessions.Default(ctx)
	userID := session.Get("user_id")

	connID := ctx.Param("id")
	if connID == "" {
		response.BadRequest(ctx, "Connection ID is required", nil)
		return
	}

	conn, err := connections.GetConnectionByID(h.Cfg.DBClient, connID, userID.(string))
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	if conn == nil {
		response.NotFound(ctx, "Connection not found")
		return
	}

	response.JSON(ctx, http.StatusOK, "Connection details", conn)
}