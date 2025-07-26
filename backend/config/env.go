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
	SessionSecret      string        `env:"SESSION_SECRET" envDefault:"sessions-secret-key"`
	SessionMaxAge      time.Duration `env:"SESSION_MAX_AGE" envDefault:"24h"`
	SessionSecure      bool          `env:"SESSION_SECURE" envDefault:"false"`
	MaxOpenConns       int           `env:"MAX_OPEN_CONNS" envDefault:"50"`
	MaxIdleConns       int           `env:"MAX_IDLE_CONNS" envDefault:"10"`
	ConnMaxLifetime    time.Duration `env:"CONN_MAX_LIFETIME" envDefault:"30m"`
	ConnMaxIdleTime    time.Duration `env:"CONN_MAX_IDLE_TIME" envDefault:"5m"`
	EncryptionKey      string        `env:"ENCRYPTION_KEY" envDefault:""`
}

func LoadEnv() (*Env, error) {
	env := Env{}
	if err := envconfig.Init(&env); err != nil {
		return nil, err
	}
	return &env, nil
}
