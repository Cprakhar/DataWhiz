package password

import (
	"golang.org/x/crypto/bcrypt"
)

// EncrpytPassword hashes the provided password using bcrypt and returns the hashed password as a string.
func EncrpytPassword(password string) (string, error) {
	hashPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashPassword), nil
}

// ValidatePassword compares the provided password with the hashed password and returns an error if they do not match.
func ValidatePassword(password, hashPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashPassword), []byte(password))
}