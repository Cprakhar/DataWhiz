package config

import "github.com/supabase-community/supabase-go"

type ProviderType string

const (
	ProviderGitHub ProviderType = "github"
	ProviderGoogle ProviderType = "google"
	ProviderEmail  ProviderType = "email"
)

type Config struct {
	Env            *Env
	DBClient       *supabase.Client
	ProviderEmail  ProviderType
	ProviderGoogle ProviderType
	ProviderGitHub ProviderType
}

func NewConfig() (*Config, error) {
	env, err := LoadEnv()
	if err != nil {
		return nil, err
	}

	dbClient, err := NewClient(env.SupabaseURL, env.SupabaseKey)
	if err != nil {
		return nil, err
	}

	return &Config{
		Env:            env,
		DBClient:       dbClient,
		ProviderEmail:  ProviderEmail,
		ProviderGoogle: ProviderGoogle,
		ProviderGitHub: ProviderGitHub,
	}, nil
}
