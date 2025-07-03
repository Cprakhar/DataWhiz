package models

import (
	"time"
)

type Connection struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	UserID        uint       `json:"user_id"`
	DBType        string     `json:"db_type"`
	ConnString    string     `json:"conn_string"` // Should be encrypted in production
	CreatedAt     time.Time  `json:"created_at"`
	Name          string     `json:"name,omitempty"`          // persisted
	Host          string     `json:"host,omitempty"`          // persisted
	Port          int        `json:"port,omitempty"`          // persisted
	Database      string     `json:"database,omitempty"`      // persisted
	LastConnected *time.Time `json:"lastConnected,omitempty"` // persisted

	IsConnected bool `gorm:"-" json:"isConnected"` // API-only, not persisted
}
