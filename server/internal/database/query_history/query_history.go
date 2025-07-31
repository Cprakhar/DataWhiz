package queryhistory

type QueryHistory struct {
	ID           string          `json:"id,omitempty"`
	UserID       string          `json:"user_id" binding:"required"`
	ConnectionID string          `json:"connection_id" binding:"required"`
	Query        string          `json:"query" binding:"required"`
	ExecutedAt   string          `json:"executed_at" binding:"required"`
	Duration     int64           `json:"duration" binding:"required"`
}
