package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/cprakhar/datawhiz/config"
	"github.com/cprakhar/datawhiz/internal/database/schema"
	"github.com/cprakhar/datawhiz/internal/database/users"
	"github.com/cprakhar/datawhiz/utils/jwt"
	"github.com/cprakhar/datawhiz/utils/password"
	"github.com/cprakhar/datawhiz/utils/response"
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

func HandleRegister(cfg *config.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req RegisterRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			response.BadRequest(ctx, "Invalid request data", err)
			return
		}

		exists, err := users.CheckUserExists(cfg.DBClient, req.Email)
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
			Name:          req.Name,
			Email:         req.Email,
			Password:      hashedPassword,
			AvatarURL:     "",                        // Set default avatar or handle later
			OAuthProvider: string(cfg.ProviderEmail), // Assuming email registration
			OAuthID:       "",                        // No OAuth ID for email registration
		}
		createdUser, err := users.InsertOneUser(cfg.DBClient, newUser)
		if err != nil {
			response.InternalError(ctx, err)
			return
		}
		response.JSON(ctx, http.StatusCreated, "User registered successfully", createdUser)
	}
}

func HandleLogin(cfg *config.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req LoginRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			response.BadRequest(ctx, "Invalid request data", err)
			return
		}

		exists, err := users.CheckUserExists(cfg.DBClient, req.Email)
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
		data, _, err := cfg.DBClient.From("users").Select("*", "", false).Eq("email", req.Email).Single().Execute()
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

		token, err := jwt.GenerateJWT(dbUser.ID, dbUser.Email, cfg.Env.JWTSecret, cfg.Env.JWTExpiresIn)
		if err != nil {
			response.InternalError(ctx, err)
			return
		}

		ctx.SetCookie(
			"access_token",
			token,
			int(cfg.Env.JWTExpiresIn.Seconds()),
			"/",
			"",
			false,
			true,
		)

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
}
