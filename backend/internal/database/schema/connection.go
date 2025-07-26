package schema

import "time"

type Connection struct {
	ID             string     `json:"id,omitempty"`
	UserID         string     `json:"user_id" binding:"required"`
	Port           int        `json:"port,omitempty"`
	Host           string     `json:"host,omitempty"`
	Username       string     `json:"username" binding:"required"`
	Password       string     `json:"password_hash" binding:"required"`
	CreatedAt      *time.Time `json:"created_at,omitempty"`
	IsActive       bool       `json:"is_active,omitempty"`
	DBType         string     `json:"db_type" binding:"required"`
	ConnectionName string     `json:"connection_name" binding:"required"`
	SSLMode        string     `json:"ssl_mode,omitempty"`
	DBName         string     `json:"db_name" binding:"required"`
}

type ConnectionRequest struct {
    UserID          string `json:"user_id" binding:"required"`
    Port            int    `json:"port,omitempty"`
    Host            string `json:"host,omitempty"`
    Username        string `json:"username,omitempty"`
    Password        string `json:"password,omitempty"`
    DBType          string `json:"db_type" binding:"required"`
    ConnectionName  string `json:"connection_name" binding:"required"`
    SSLMode         string `json:"ssl_mode,omitempty"`
    DBName          string `json:"db_name,omitempty"`
}
