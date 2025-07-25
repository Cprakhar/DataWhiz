package secure

import (
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func SetSessionCookie(ctx *gin.Context, data map[string]interface{}) error {
	session := sessions.Default(ctx)
	for key, value := range data {
		session.Set(key, value)
	}
	if err := session.Save(); err != nil {
		return err
	}
	return nil
}