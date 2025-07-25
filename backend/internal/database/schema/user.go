package schema

import "time"

type User struct {
	ID            string    `json:"id,omitempty"`
	Name          string    `json:"name" binding:"required"`
	Password      string    `json:"password_hash"`
	Email         string    `json:"email" binding:"required,email"`
	AvatarURL     string    `json:"avatar_url,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	OAuthProvider string    `json:"oauth_provider,omitempty"`
	OAuthID       string    `json:"oauth_id,omitempty"`
}
