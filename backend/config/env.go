package config

import (
	"time"

	"github.com/vrischmann/envconfig"
)

type Env struct {
	Port               string        `env:"PORT" envDefault:"8080"`
	FrontendBaseURL    string        `env:"FRONTEND_BASE_URL" envDefault:"http://localhost:3000"`
	GitHubClientID     string        `env:"GITHUB_CLIENT_ID" envDefault:""`
	GitHubClientSecret string        `env:"GITHUB_CLIENT_SECRET" envDefault:""`
	GoogleClientID     string        `env:"GOOGLE_CLIENT_ID" envDefault:""`
	GoogleClientSecret string        `env:"GOOGLE_CLIENT_SECRET" envDefault:""`
	SupabaseURL        string        `env:"SUPABASE_URL" envDefault:""`
	SupabaseKey        string        `env:"SUPABASE_KEY" envDefault:""`
	GroqAPIKey         string        `env:"GROQ_API_KEY" envDefault:""`
	SessionsSecret     string        `env:"SESSIONS_SECRET" envDefault:"sessions-secret-key"`
	SessionMaxAge      time.Duration `env:"SESSION_MAX_AGE" envDefault:"24h"`
	SessionsSecure     bool          `env:"SESSIONS_SECURE" envDefault:"false"`
}

func LoadEnv() (*Env, error) {
	env := Env{}
	if err := envconfig.Init(&env); err != nil {
		return nil, err
	}
	return &env, nil
}
