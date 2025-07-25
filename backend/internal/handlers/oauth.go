package handlers

import (
	"net/http"

	"github.com/cprakhar/datawhiz/internal/database/schema"
	"github.com/cprakhar/datawhiz/internal/database/users"
	"github.com/cprakhar/datawhiz/utils/response"
	"github.com/cprakhar/datawhiz/utils/secure"
	"github.com/gin-gonic/gin"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/github"
	"github.com/markbates/goth/providers/google"
)

func (h *Handler) InitProviders() {
	goth.UseProviders(
		google.New(
			h.Cfg.Env.GoogleClientID,
			h.Cfg.Env.GoogleClientSecret,
			h.Cfg.Env.FrontendBaseURL + "/auth/oauth/callback?provider=google",
			"email", "profile",
		),
		github.New(
			h.Cfg.Env.GitHubClientID,
			h.Cfg.Env.GitHubClientSecret,
			h.Cfg.Env.FrontendBaseURL + "/auth/oauth/callback?provider=github",
			"read:user",
		),
	)
}


func (h *Handler) HandleOAuthSignIn (ctx *gin.Context) {
	provider := ctx.Query("provider")

	req := gothic.GetContextWithProvider(ctx.Request, provider)
	gothic.BeginAuthHandler(ctx.Writer, req)
}

func (h *Handler) HandleOAuthCallback(ctx *gin.Context) {
	provider := ctx.Query("provider")
	req := gothic.GetContextWithProvider(ctx.Request, provider)
	user, err := gothic.CompleteUserAuth(ctx.Writer, req)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	exists, err := users.CheckUserExists(h.Cfg.DBClient, user.Email)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}

	if !exists {
		newUser := &schema.User{
			Name: user.Name,
			Email: user.Email,
			AvatarURL: user.AvatarURL,
			OAuthProvider: provider,
			OAuthID: user.UserID,
		}
		createdUser, err := users.InsertOneUser(h.Cfg.DBClient, newUser)
		if err != nil {
			response.InternalError(ctx, err)
			return
		}

		err = secure.SetSessionCookie(ctx, 
			map[string]interface{}{
				"user_id": createdUser.ID,
				"email": createdUser.Email,
			},
		)
		if err != nil {
			response.InternalError(ctx, err)
			return
		}

		response.JSON(ctx, http.StatusCreated, "OAuth user created and logged in", createdUser)
		return
	}

	existingUser, err := users.GetUserByEmail(h.Cfg.DBClient, user.Email)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	
	err = secure.SetSessionCookie(ctx, 
		map[string]interface{}{
			"user_id": existingUser.ID,
			"email": existingUser.Email,
		},
	)
	if err != nil {
		response.InternalError(ctx, err)
		return
	}
	
	response.JSON(ctx, http.StatusOK, "OAuth user logged in", existingUser)
}