package models

import (
	"time"
)

type Connection struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `json:"user_id"`
	DBType     string    `json:"db_type"`
	ConnString string    `json:"conn_string"` // Should be encrypted in production
	CreatedAt  time.Time `json:"created_at"`
}
