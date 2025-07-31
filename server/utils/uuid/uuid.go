package uuid

import "github.com/google/uuid"

func ConvertUUIDifPossible(val interface{}) interface{} {
	if uuidBytes, ok := val.([16]byte); ok {
		return uuid.UUID(uuidBytes).String()
	}
	return val
}