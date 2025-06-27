package models

import (
	"time"
)

type QueryHistory struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	UserID         uint      `json:"user_id"`
	Prompt         string    `json:"prompt"`
	GeneratedQuery string    `json:"generated_query"`
	DBType         string    `json:"db_type"`
	ExecutedAt     time.Time `json:"executed_at"`
	ResultSample   string    `json:"result_sample"`
}
