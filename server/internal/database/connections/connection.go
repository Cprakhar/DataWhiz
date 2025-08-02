package connections

import (
	"encoding/json"
	"errors"
	"log"

	"github.com/cprakhar/datawhiz/internal/database/schema"
	"github.com/cprakhar/datawhiz/internal/db_driver/sql"
	"github.com/supabase-community/supabase-go"
)

type ResponseConnection struct {
	ID             string `json:"id"`
	Host           string `json:"host"`
	Port           string `json:"port"`
	Username       string `json:"username"`
	DBType         string `json:"dbType"`
	ConnectionName string `json:"connName"`
	SSLMode        bool   `json:"sslMode"`
	DBName         string `json:"dbName"`
	IsActive       bool   `json:"isActive"`
	DBFilePath     string `json:"dbFilePath,omitempty"`
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
		DBFilePath:     newConn.DBFilePath,
	}, nil
}

// CheckConnectionExistsHandler checks if a connection with the same name, db_type, host, port, and user_id exists for the user.
func CheckConnectionExists(client *supabase.Client, req *schema.ManualConnectionForm, userId string) (bool, error) {
	query := client.From("connections").Select("*", "exact", false).Eq("user_id", userId).
		Eq("connection_name", req.ConnName).
		Eq("db_type", req.DBType)

	if req.DBType == "sqlite" {
		query = query.Eq("db_filepath", req.DBFilePath)
	} else {
		query = query.Eq("host", req.Host).
			Eq("port", req.Port).
			Eq("username", req.Username)
	}

	data, count, err := query.Single().Execute()

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

// GetConnectionsByUserID retrieves all connections for a given user ID and returns them as a slice of ResponseConnection.
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
		if conn.DBType == "sqlite" {
			conn.DBName = sql.ExtractSQLiteDBName(conn.DBFilePath)
		}
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

// DeleteConnection deletes a connection by its ID and user ID.
func DeleteConnection(client *supabase.Client, id, userID string) error {
	_, _, err := client.From("connections").Delete("minimal", "").Eq("id", id).Eq("user_id", userID).Single().Execute()
	if err != nil {
		return err
	}

	return nil
}

// GetConnectionStringByID retrieves the connection string for a specific connection ID and user ID.
func GetConnectionStringByID(client *supabase.Client, id, userID string) (string, error) {
	data, count, err := client.From("connections").Select("connection_string", "exact", false).
		Eq("id", id).
		Eq("user_id", userID).
		Single().Execute()

	if err != nil {
		if count == 0 {
			return "", nil // No connection found
		}
		return "", err
	}

	var result struct {
		ConnString string `json:"connection_string"`
	}
	if err := json.Unmarshal(data, &result); err != nil {
		return "", err
	}
	return result.ConnString, nil
}

// SetConnectionActive updates the is_active status of a connection for a specific user.
func SetConnectionActive(client *supabase.Client, id, userID string, isActive bool) error {
	_, count, err := client.From("connections").
		Update(map[string]interface{}{"is_active": isActive}, "minimal", "exact").
		Eq("id", id).Eq("user_id", userID).Single().Execute()

	if err != nil {
		if count == 0 {
			return errors.New("connection not found")
		}
		return err
	}
	return nil
}

// GetConnectionByID retrieves a connection by its ID and user ID, returning it as a ResponseConnection.
func GetConnectionByID(client *supabase.Client, id, userID string) (*ResponseConnection, error) {
	data, count, err := client.From("connections").Select("*", "exact", false).
		Eq("id", id).Eq("user_id", userID).Single().Execute()
	if err != nil {
		if count == 0 {
			return nil, nil // No connection found
		}
		return nil, err
	}

	var conn schema.Connection
	if err := json.Unmarshal(data, &conn); err != nil {
		return nil, err
	}

	return &ResponseConnection{
		ID:             conn.ID,
		Host:           conn.Host,
		Port:           conn.Port,
		Username:       conn.Username,
		DBType:         conn.DBType,
		ConnectionName: conn.ConnectionName,
		SSLMode:        conn.SSLMode,
		DBName:         conn.DBName,
		IsActive:       conn.IsActive,
	}, nil
}

// SetAllConnectionsInactive sets all connections to inactive (global).
func SetAllConnectionsInactive(client *supabase.Client) error {
	_, count, err := client.From("connections").
		Update(map[string]interface{}{"is_active": false}, "minimal", "exact").
		Match(map[string]string{"is_active": "TRUE"}).
		Execute()
	if err != nil {
		if count == 0 {
			return errors.New("no active connections found")
		}
		return err
	}
	return nil
}

// SetAllConnectionsInactiveForUser sets all connections for a specific user to inactive.
func SetAllConnectionsInactiveForUser(client *supabase.Client, userID string) error {
	_, count, err := client.From("connections").
		Update(map[string]interface{}{"is_active": false}, "minimal", "exact").
		Match(map[string]string{"user_id": userID, "is_active": "TRUE"}).
		Execute()
	if err != nil {
		if count == 0 {
			return errors.New("no active connections found for user")
		}
		return err
	}
	return nil
}
