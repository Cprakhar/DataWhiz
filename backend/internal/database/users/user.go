package users

import (
	"encoding/json"

	"github.com/cprakhar/datawhiz/internal/database/schema"
	"github.com/supabase-community/supabase-go"
)

type ResponseUser struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	AvatarURL     string `json:"avatar_url"`
	OAuthProvider string `json:"auth_provider"`
}

func InsertOneUser(client *supabase.Client, user *schema.User) (*ResponseUser, error) {
	data, _, err := client.From("users").Insert(user, false, "", "representation", "exact").Single().Execute()
	if err != nil {
		return nil, err
	}

	var newUser schema.User
	if err := json.Unmarshal(data, &newUser); err != nil {
		return nil, err
	}
	
	return &ResponseUser{
		ID:            newUser.ID,
		Name:          newUser.Name,
		Email:         newUser.Email,
		AvatarURL:     newUser.AvatarURL,
		OAuthProvider: newUser.OAuthProvider,
	}, nil
}

func GetUserByEmail(client *supabase.Client, email string) (*ResponseUser, error) {
	data, count, err := client.From("users").Select("*", "", false).Eq("email", email).Single().Execute()
	if err != nil {
		if count == 0 {
			return nil, nil
		}
		return nil, err
	}
	var user schema.User
	if err := json.Unmarshal(data, &user); err != nil {
		return nil, err
	}
	return &ResponseUser{
		ID:            user.ID,
		Name:          user.Name,
		Email:         user.Email,
		AvatarURL:     user.AvatarURL,
		OAuthProvider: user.OAuthProvider,
	}, nil
}

func GetUserByID(client *supabase.Client, id string) (*ResponseUser, error) {
	data, count, err := client.From("users").Select("*", "exact", false).Eq("id", id).Single().Execute()
	if err != nil {
		if count == 0 {
			return nil, nil
		}
		return nil, err
	}

	var user schema.User
	if err := json.Unmarshal(data, &user); err != nil {
		return nil, err
	}
	return &ResponseUser{
		ID:            user.ID,
		Name:          user.Name,
		Email:         user.Email,
		AvatarURL:     user.AvatarURL,
		OAuthProvider: user.OAuthProvider,
	}, nil
}

func CheckUserExists(client *supabase.Client, email string) (bool, error) {
	user, err := GetUserByEmail(client, email)
	if err != nil {
		return false, err
	}
	if user == nil {
		return false, nil
	}
	return true, nil
}
