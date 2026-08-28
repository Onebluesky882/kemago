package main

import (
	"context"
	"log"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/onebluesky882/coarea/backend/api-go/internal/authtoken"
	"github.com/onebluesky882/coarea/backend/api-go/internal/config"
	"github.com/onebluesky882/coarea/backend/api-go/internal/db"
	"github.com/onebluesky882/coarea/backend/api-go/internal/handlers"
	"github.com/onebluesky882/coarea/backend/api-go/internal/otp"
	"github.com/onebluesky882/coarea/backend/api-go/internal/redisclient"
	"github.com/onebluesky882/coarea/backend/api-go/internal/sms"
)

const jwtTTL = 30 * 24 * time.Hour

func main() {
	ctx := context.Background()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	database, err := db.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer database.Close()

	if err := db.Migrate(ctx, database); err != nil {
		log.Fatalf("db migrate: %v", err)
	}

	redisClient, err := redisclient.New(ctx, cfg.RedisURL)
	if err != nil {
		log.Fatalf("redis: %v", err)
	}
	defer redisClient.Close()

	smsClient := sms.NewClient(cfg.ThaibulkSMSKey, cfg.ThaibulkSMSSecret, cfg.SMSSender)
	otpService := otp.NewService(redisClient, smsClient)
	tokenIssuer := authtoken.NewIssuer(cfg.JWTSecret, jwtTTL)
	otpHandler := handlers.NewOTPHandler(otpService, database, tokenIssuer)

	app := fiber.New()

	app.Get("/health", handlers.Health)

	api := app.Group("/api")
	api.Post("/otp/request", otpHandler.Request)
	api.Post("/otp/verify", otpHandler.Verify)
	// Matches the webhook URL already registered in the ThaiBulkSMS
	// dashboard for this app (GET method, /api/otp) — see TODO.md.
	api.Get("/otp", otpHandler.DeliveryWebhook)
	api.Post("/otp", otpHandler.DeliveryWebhook)

	// Proves RequireAuth end-to-end: GET /api/me with a valid Bearer token
	// (from otp/verify's response) returns the token's own claims.
	api.Get("/me", handlers.RequireAuth(tokenIssuer), handlers.Me)

	log.Printf("api-go listening on :%s", cfg.Port)
	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatalf("listen: %v", err)
	}
}
