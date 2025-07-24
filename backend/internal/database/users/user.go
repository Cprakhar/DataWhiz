package users

import (
	"encoding/json"
	"fmt"
	"strings"

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
	data, _, err := client.From("users").Insert(user, false, "", "representation", "exact").Execute()
	if err != nil {
		return nil, err
	}

	var users []schema.User
	if err := json.Unmarshal(data, &users); err != nil {
		return nil, err
	}
	if len(users) == 0 {
		return nil, fmt.Errorf("no user returned from insert")
	}
	u := users[0]
	return &ResponseUser{
		ID:            u.ID,
		Name:          u.Name,
		Email:         u.Email,
		AvatarURL:     u.AvatarURL,
		OAuthProvider: u.OAuthProvider,
	}, nil
}

func GetUserByEmail(client *supabase.Client, email string) (*ResponseUser, error) {
	data, _, err := client.From("users").Select("*", "", false).Eq("email", email).Single().Execute()
	if err != nil {
		if err.Error() != "" && strings.Contains(err.Error(), "PGRST116") {
			return  nil, nil
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
	data, _, err := client.From("users").Select("*", "", false).Eq("id", id).Single().Execute()
	if err != nil {
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
