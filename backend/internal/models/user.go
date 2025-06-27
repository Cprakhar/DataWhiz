package models

import (
	"time"
)

type User struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Email         string    `gorm:"unique;not null" json:"email"`
	PasswordHash  string    `gorm:"not null" json:"-"`
	OAuthProvider string    `json:"oauth_provider"`
	Name          string    `json:"name"`
	AvatarURL     string    `json:"avatar_url"`
	CreatedAt     time.Time `json:"created_at"`
}
