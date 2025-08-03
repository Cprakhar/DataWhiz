package secure

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
)

// Encrypt encrypts the provided data using AES encryption with the given secret key.
func Encrypt(data, secretKey string) (string, error) {
	block, err := aes.NewCipher([]byte(secretKey))
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err:= io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	cipherText := aesGCM.Seal(nonce, nonce, []byte(data), nil)

	return base64.URLEncoding.EncodeToString(cipherText), nil
}	

// Decrypt decrypts the provided encrypted data using AES decryption with the given secret key.
func Decrypt(encryptedData, secretKey string) (string, error) {
	cipherText, err := base64.URLEncoding.DecodeString(encryptedData)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher([]byte(secretKey))
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := aesGCM.NonceSize()
	if len(cipherText) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, cipherData := cipherText[:nonceSize], cipherText[nonceSize:]
	data, err := aesGCM.Open(nil, nonce, cipherData, nil)
	if err != nil {
		return "", err
	}

	return string(data), nil
}