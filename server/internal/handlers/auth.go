package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/cprakhar/datawhiz/internal/database/connections"
	"github.com/cprakhar/datawhiz/internal/database/schema"
	"github.com/cprakhar/datawhiz/internal/database/users"
	poolmanager "github.com/cprakhar/datawhiz/internal/pool_manager"
	"github.com/cprakhar/datawhiz/utils/password"
	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/cprakhar/datawhiz/utils/secure"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// HandleRegister handles user registration by creating a new user in the database.
func (h *Handler) HandleRegister(ctx *gin.Context) {
	var req RegisterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "Invalid request data", err)
		return
	}

	exists, err := users.CheckUserExists(h.Cfg.DBClient, req.Email)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	if exists {
		response.BadRequest(ctx, fmt.Sprintf("User already exists with email: %s", req.Email), nil)
		return
	}

	hashedPassword, err := password.EncrpytPassword(req.Password)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	newUser := &schema.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
	}
	createdUser, err := users.InsertOneUser(h.Cfg.DBClient, newUser)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	response.JSON(ctx, http.StatusCreated, "User registered successfully", createdUser)
}

// HandleLogin handles user login by validating credentials and setting a session cookie.
func (h *Handler) HandleLogin(ctx *gin.Context) {
	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "Invalid request data", err)
		return
	}

	exists, err := users.CheckUserExists(h.Cfg.DBClient, req.Email)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	if !exists {
		response.Unauthorized(ctx, fmt.Sprintf("User not found with email: %s", req.Email))
		return
	}
	// Fetch full user (with password) for validation
	var dbUser schema.User
	data, _, err := h.Cfg.DBClient.From("users").Select("*", "", false).Eq("email", req.Email).Single().Execute()
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	if err := json.Unmarshal(data, &dbUser); err != nil {
		response.InternalError(ctx, err)
		return
	}
	if err := password.ValidatePassword(req.Password, dbUser.Password); err != nil {
		response.Unauthorized(ctx, "Invalid password")
		return
	}

	err = secure.SetSessionCookie(ctx,
		map[string]interface{}{
			"user_id": dbUser.ID,
			"email":   dbUser.Email,
		},
	)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	// Return safe user fields only
	safeUser := &users.ResponseUser{
		ID:            dbUser.ID,
		Name:          dbUser.Name,
		Email:         dbUser.Email,
		AvatarURL:     dbUser.AvatarURL,
		OAuthProvider: dbUser.OAuthProvider,
	}
	response.JSON(ctx, http.StatusOK, "User logged in successfully", safeUser)
}

// HandleLogout handles user logout by clearing the session cookie.
func (h *Handler) HandleLogout(ctx *gin.Context) {
	session := sessions.Default(ctx)
	userID := session.Get("user_id")
	
	poolmanager.DeactivateAllUserPools(userID.(string))
	err := connections.SetAllConnectionsInactiveForUser(h.Cfg.DBClient, userID.(string))
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	session.Clear()
	if err := session.Save(); err != nil {
		response.InternalError(ctx, err)
		return
	}
	response.OK(ctx, "User logged out successfully")
}