package config

import (
	"github.com/vrischmann/envconfig"
	"time"
)

type Env struct {
	Port               string `env:"PORT" envDefault:"8080"`
	Host               string `env:"HOST" envDefault:"localhost"`
	GitHubClientID     string `env:"GITHUB_CLIENT_ID" envDefault:""`
	GitHubClientSecret string `env:"GITHUB_CLIENT_SECRET" envDefault:""`
	GoogleClientID     string `env:"GOOGLE_CLIENT_ID" envDefault:""`
	GoogleClientSecret string `env:"GOOGLE_CLIENT_SECRET" envDefault:""`
	SupabaseURL        string `env:"SUPABASE_URL" envDefault:""`
	SupabaseKey        string `env:"SUPABASE_KEY" envDefault:""`
	JWTSecret          string `env:"JWT_SECRET" envDefault:"jwt-secret-key"`
	GroqAPIKey         string `env:"GROQ_API_KEY" envDefault:""`
	JWTExpiresIn       time.Duration `env:"JWT_EXPIRES_IN" envDefault:"24h"`
}

func LoadEnv() (*Env, error) {
	env := Env{}
	if err := envconfig.Init(&env) ; err != nil {
		return nil, err
	}
	return &env, nil
}
