package schema

import "encoding/json"

type ResponseTable struct {
	Records json.RawMessage `json:"records"`
	Schema []Column `json:"schema"`
}

type Column struct {
	Name             string `json:"name" binding:"required"`
	Type             string `json:"type" binding:"required"`
	IsNullable       bool   `json:"is_nullable,omitempty"`
	IsPrimaryKey     bool   `json:"is_primary_key,omitempty"`
	IsForeignKey     bool   `json:"is_foreign_key,omitempty"`
	ForeignKeyTable  string `json:"foreign_key_table,omitempty"`
	ForeignKeyColumn string `json:"foreign_key_column,omitempty"`
	IsUnique         bool   `json:"is_unique,omitempty"`
	DefaultValue     string `json:"default_value,omitempty"`
}
