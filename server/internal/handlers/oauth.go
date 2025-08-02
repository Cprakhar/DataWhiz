package handlers

import (
	"log"
	"net/http"

	"github.com/cprakhar/datawhiz/internal/database/schema"
	"github.com/cprakhar/datawhiz/internal/database/users"

	"github.com/cprakhar/datawhiz/utils/secure"
	"github.com/gin-gonic/gin"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/github"
	"github.com/markbates/goth/providers/google"
)

// InitProviders initializes the OAuth providers with the necessary credentials.
func (h *Handler) InitProviders() {
	goth.UseProviders(
		google.New(
			h.Cfg.Env.GoogleClientID,
			h.Cfg.Env.GoogleClientSecret,
			h.Cfg.Env.BackendBaseURL + "/api/v1/auth/oauth/callback?provider=google",
			"email", "profile",
		),
		github.New(
			h.Cfg.Env.GitHubClientID,
			h.Cfg.Env.GitHubClientSecret,
			h.Cfg.Env.BackendBaseURL + "/api/v1/auth/oauth/callback?provider=github",
			"read:user",
		),
	)
}

// HandleOAuthSignIn initiates the OAuth sign-in process by redirecting to the provider's authentication page.
func (h *Handler) HandleOAuthSignIn (ctx *gin.Context) {
	provider := ctx.Query("provider")
	log.Println(ctx.Request.URL)

	req := gothic.GetContextWithProvider(ctx.Request, provider)
	gothic.BeginAuthHandler(ctx.Writer, req)
}

// HandleOAuthCallback handles the OAuth callback after the user has authenticated with the provider.
func (h *Handler) HandleOAuthCallback(ctx *gin.Context) {
	provider := ctx.Query("provider")
	redirectURL := h.Cfg.Env.FrontendBaseURL + "/auth/oauth/callback?provider=" + provider
	req := gothic.GetContextWithProvider(ctx.Request, provider)

	user, err := gothic.CompleteUserAuth(ctx.Writer, req)
	if err != nil {
		log.Println("Error completing OAuth authentication:", err)
		ctx.Redirect(http.StatusTemporaryRedirect, redirectURL+"&status=error")
		return
	}

	exists, err := users.CheckUserExists(h.Cfg.DBClient, user.Email)
	if err != nil {
		log.Println("Error checking if user exists:", err)
		ctx.Redirect(http.StatusTemporaryRedirect, redirectURL+"&status=error")
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
			log.Println("Error creating new user:", err)
			ctx.Redirect(http.StatusTemporaryRedirect, redirectURL+"&status=error")
			return
		}

		err = secure.SetSessionCookie(ctx, 
			map[string]interface{}{
				"user_id": createdUser.ID,
				"email": createdUser.Email,
			},
		)
		if err != nil {
			log.Println("Error setting session cookie:", err)
			ctx.Redirect(http.StatusTemporaryRedirect, redirectURL+"&status=error")
			return
		}
		ctx.Redirect(http.StatusTemporaryRedirect, redirectURL+"&status=success")
		return
	}

	upsertUser := &schema.User{
		Name: user.Name,
		Email: user.Email,
		AvatarURL: user.AvatarURL,
		OAuthProvider: provider,
		OAuthID: user.UserID,
	}
	updatedUser, err := users.UpsertOAuthUser(h.Cfg.DBClient, upsertUser)
	if err != nil {
		log.Println("Error upserting user:", err)
		ctx.Redirect(http.StatusTemporaryRedirect, redirectURL+"&status=error")
		return
	}
	err = secure.SetSessionCookie(ctx, 
		map[string]interface{}{
			"user_id": updatedUser.ID,
			"email": updatedUser.Email,
		},
	)
	if err != nil {
		log.Println("Error setting session cookie:", err)
		ctx.Redirect(http.StatusTemporaryRedirect, redirectURL+"&status=error")
		return
	}
	ctx.Redirect(http.StatusTemporaryRedirect, redirectURL+"&status=success")
}