package queryhistory

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/supabase-community/supabase-go"
)

type QueryHistory struct {
	ID             string `json:"id,omitempty"`
	UserID         string `json:"user_id" binding:"required"`
	ConnectionID   string `json:"conn_id" binding:"required"`
	Query          string `json:"query" binding:"required"`
	GeneratedQuery string `json:"generated_query" binding:"required"`
	ExecutedAt     time.Time `json:"executed_at" binding:"required"`
	Duration       int64  `json:"duration" binding:"required"`
}

// SaveQueryHistory saves a query history record to the Supabase database.
func SaveQueryHistory(client *supabase.Client, history *QueryHistory) error {
	data, count, err := client.From("query_history").Insert(history, false, "", "representation", "exact").Single().Execute()
	if err != nil {
		if count == 0 {
			return errors.New("failed to save query history")
		}
	}

	var savedHistory QueryHistory
	if err := json.Unmarshal(data, &savedHistory); err != nil {
		return err
	}

	return nil
}

// GetQueryHistoryByConnectionID retrieves query history records for a specific connection ID.
func GetQueryHistoryByConnectionID(client *supabase.Client, connectionID string) ([]QueryHistory, error) {
	data, count, err := client.From("query_history").Select("*", "exact", false).Eq("conn_id", connectionID).Execute()
	if err != nil {
		if count == 0 {
			return nil, errors.New("no query history found for the given connection ID")
		}
		return nil, err
	}

	var histories []QueryHistory
	if err := json.Unmarshal(data, &histories); err != nil {
		return nil, err
	}

	return histories, nil
}