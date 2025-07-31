package uuid

import "github.com/google/uuid"

// ConvertUUIDifPossible checks if the provided value is a UUID in byte format
func ConvertUUIDifPossible(val interface{}) interface{} {
	if uuidBytes, ok := val.([16]byte); ok {
		return uuid.UUID(uuidBytes).String()
	}
	return val
}