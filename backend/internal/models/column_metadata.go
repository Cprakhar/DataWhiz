package models

import (
	"database/sql"
)

type ColumnMeta struct {
	   Name       string         `json:"name"`
	   DataType   string         `json:"data_type"`
	   Nullable   bool           `json:"nullable"`
	   Default    sql.NullString `json:"default,omitempty"`
	   PrimaryKey bool           `json:"primary_key,omitempty"`
	   ForeignKey bool           `json:"foreign_key,omitempty"`
	   UniqueKey  bool           `json:"unique_key,omitempty"`
}