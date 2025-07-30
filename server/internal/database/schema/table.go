package schema

import "database/sql"

type ColumnSchema struct {
	Name             string         `json:"name" binding:"required"`
	Type             string         `json:"type" binding:"required"`
	IsNullable       bool           `json:"is_nullable,omitempty"`
	IsPrimaryKey     bool           `json:"is_primary_key,omitempty"`
	IsForeignKey     bool           `json:"is_foreign_key,omitempty"`
	ForeignKeyTable  string         `json:"foreign_key_table,omitempty"`
	ForeignKeyColumn string         `json:"foreign_key_column,omitempty"`
	IsUnique         bool           `json:"is_unique,omitempty"`
	DefaultValue     sql.NullString `json:"default_value,omitempty"`
	Indexes          []string       `json:"indexes,omitempty"`
}
