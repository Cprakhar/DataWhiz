package schema

import "time"

type Connection struct {
	ID             string     `json:"id,omitempty"`
	UserID         string     `json:"user_id" binding:"required"`
	Port           string     `json:"port,omitempty"`
	Host           string     `json:"host,omitempty"`
	Username       string     `json:"username,omitempty"`
	Password       string     `json:"password,omitempty"`
	CreatedAt      *time.Time `json:"created_at,omitempty"`
	IsActive       bool       `json:"is_active,omitempty"`
	DBType         string     `json:"db_type" binding:"required"`
	ConnectionName string     `json:"connection_name" binding:"required"`
	SSLMode        bool       `json:"ssl_mode"`
	DBName         string     `json:"db_name" binding:"required"`
	DBFilePath     string     `json:"db_filepath,omitempty"`
	ConnString     string     `json:"connection_string,omitempty"`
}

type ConnectionRequest struct {
	ManualConn *ManualConnectionForm `json:"manual,omitempty"`
	StringConn *StringConnectionForm `json:"string,omitempty"`
}

type ManualConnectionForm struct {
	IsSRV      bool   `json:"isSrv,omitempty"`
	Port       string `json:"port,omitempty"`
	Host       string `json:"host,omitempty"`
	Username   string `json:"username,omitempty"`
	Password   string `json:"password,omitempty"`
	DBType     string `json:"dbType" binding:"required"`
	ConnName   string `json:"connName"`
	SSLMode    bool   `json:"sslMode,omitempty"`
	DBName     string `json:"dbName,omitempty"`
	DBFilePath string `json:"dbFilePath,omitempty"`
}

type StringConnectionForm struct {
	ConnString string `json:"connString" binding:"required"`
	DBType     string `json:"dbType" binding:"required"`
	ConnName   string `json:"connName"`
}
