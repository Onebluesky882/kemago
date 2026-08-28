package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port        string
	DatabaseURL string
	RedisURL    string
	JWTSecret   string

	// ThaiBulkSMS — kept configured but currently inactive (see main.go);
	// switch back by swapping which otp.Provider main.go instantiates.
	ThaibulkSMSKey    string
	ThaibulkSMSSecret string
	SMSSender         string

	// SMSMKT (Clicknext). SMSMKTSender is for the plain send-message API
	// (currently inactive); SMSMKTProjectKey is for their managed OTP
	// product (currently inactive too — swapped for email to avoid
	// per-message SMS cost at low volume; see internal/otp/smsmkt_provider.go).
	SMSMKTAPIKey     string
	SMSMKTSecretKey  string
	SMSMKTSender     string
	SMSMKTProjectKey string

	// Resend — active OTP provider (email). Same provider packages/email
	// (the original TS backend) already uses — see internal/email.
	ResendAPIKey string
	EmailFrom    string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:              getEnv("PORT", "3000"),
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		RedisURL:          getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:         os.Getenv("JWT_SECRET"),
		ThaibulkSMSKey:    os.Getenv("THAIBULK_SMS_KEY"),
		ThaibulkSMSSecret: os.Getenv("THAIBULK_SMS_SECRET"),
		SMSSender:         getEnv("SMS_SENDER", "Demo"),
		SMSMKTAPIKey:      os.Getenv("SMSMKT_API_KEY"),
		SMSMKTSecretKey:   os.Getenv("SMSMKT_SECRET_KEY"),
		SMSMKTSender:      os.Getenv("SMSMKT_SENDER"),
		SMSMKTProjectKey:  os.Getenv("SMSMKT_PROJECT_KEY"),
		ResendAPIKey:      os.Getenv("RESEND_API_KEY"),
		EmailFrom:         getEnv("EMAIL_FROM", "Coarea <onboarding@resend.dev>"),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}
	if cfg.ResendAPIKey == "" {
		return nil, fmt.Errorf("RESEND_API_KEY is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
