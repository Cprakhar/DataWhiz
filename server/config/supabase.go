package config

import "github.com/supabase-community/supabase-go"

func NewClient(supabaseURL, supabaseKey string) (*supabase.Client, error) {
	client, err := supabase.NewClient(supabaseURL, supabaseKey, &supabase.ClientOptions{})
	if err != nil {
		return nil, err
	}
	return client, nil
}