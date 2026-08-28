package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port              string
	DatabaseURL       string
	RedisURL          string
	ThaibulkSMSKey    string
	ThaibulkSMSSecret string
	SMSSender         string
	JWTSecret         string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:              getEnv("PORT", "3000"),
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		RedisURL:          getEnv("REDIS_URL", "redis://localhost:6379"),
		ThaibulkSMSKey:    os.Getenv("THAIBULK_SMS_KEY"),
		ThaibulkSMSSecret: os.Getenv("THAIBULK_SMS_SECRET"),
		SMSSender:         getEnv("SMS_SENDER", "Coarea"),
		JWTSecret:         os.Getenv("JWT_SECRET"),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.ThaibulkSMSKey == "" || cfg.ThaibulkSMSSecret == "" {
		return nil, fmt.Errorf("THAIBULK_SMS_KEY and THAIBULK_SMS_SECRET are required")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
