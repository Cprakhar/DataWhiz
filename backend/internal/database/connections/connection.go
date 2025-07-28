package connections

import (
	"encoding/json"
	"log"

	"github.com/cprakhar/datawhiz/internal/database/schema"
	"github.com/supabase-community/supabase-go"
)

type ResponseConnection struct {
	ID             string `json:"id"`
	Host           string `json:"host"`
	Port           int    `json:"port"`
	Username       string `json:"username"`
	DBType         string `json:"db_type"`
	ConnectionName string `json:"connection_name"`
	SSLMode        bool   `json:"ssl_mode"`
	DBName         string `json:"db_name"`
	IsActive       bool   `json:"is_active"`
}

// InsertOneConnection inserts a new connection into the database and returns the created connection.
func InsertOneConnection(client *supabase.Client, conn *schema.Connection) (*ResponseConnection, error) {
	data, _, err := client.From("connections").Insert(conn, false, "", "representation", "exact").Single().Execute()
	if err != nil {
		return nil, err
	}

	var newConn schema.Connection
	if err := json.Unmarshal(data, &newConn); err != nil {
		return nil, err
	}

	return &ResponseConnection{
		ID:             newConn.ID,
		Host:           newConn.Host,
		Port:           newConn.Port,
		Username:       newConn.Username,
		DBType:         newConn.DBType,
		ConnectionName: newConn.ConnectionName,
		SSLMode:        newConn.SSLMode,
		DBName:         newConn.DBName,
		IsActive:       newConn.IsActive,
	}, nil
}

// CheckConnectionExistsHandler checks if a connection with the same name, db_type, host, port, and user_id exists for the user.
func CheckConnectionExists(client *supabase.Client, req *schema.ManualConnectionForm, userId string) (bool, error) {
	data, count, err := client.From("connections").Select("*", "exact", false).Eq("user_id", userId).
		Eq("connection_name", req.ConnName).
		Eq("db_type", req.DBType).
		Eq("host", req.Host).
		Eq("port", req.Port).Single().
		Execute()
	if err != nil {
		if count == 0 {
			return false, nil
		}
		return false, err
	}
	var conn schema.Connection
	err = json.Unmarshal(data, &conn)
	if err != nil {
		log.Printf("Error unmarshalling connection data: %v", err)
		return false, err
	}
	log.Printf("Connection data: %+v", conn)

	return conn.ID != "", nil
}

func GetConnectionsByUserID(client *supabase.Client, userID string) ([]ResponseConnection, error) {
	data, _, err := client.From("connections").Select("*", "", false).Eq("user_id", userID).Execute()
	if err != nil {
		return nil, err
	}

	var connections []schema.Connection
	if err := json.Unmarshal(data, &connections); err != nil {
		return nil, err
	}

	var response []ResponseConnection
	for _, conn := range connections {
		response = append(response, ResponseConnection{
			ID:             conn.ID,
			Host:           conn.Host,
			Port:           conn.Port,
			Username:       conn.Username,
			DBType:         conn.DBType,
			ConnectionName: conn.ConnectionName,
			SSLMode:        conn.SSLMode,
			DBName:         conn.DBName,
			IsActive:       conn.IsActive,
		})
	}

	return response, nil
}

func DeleteConnection(client *supabase.Client, id, userID string) error {
	_, _, err := client.From("connections").Delete("minimal", "").Eq("id", id).Eq("user_id", userID).Single().Execute()
	if err != nil {
		return err
	}

	return nil
}