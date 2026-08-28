package main

import (
	"context"
	"log"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/onebluesky882/coarea/backend/api-go/internal/authtoken"
	"github.com/onebluesky882/coarea/backend/api-go/internal/config"
	"github.com/onebluesky882/coarea/backend/api-go/internal/db"
	"github.com/onebluesky882/coarea/backend/api-go/internal/email"
	"github.com/onebluesky882/coarea/backend/api-go/internal/handlers"
	"github.com/onebluesky882/coarea/backend/api-go/internal/otp"
	"github.com/onebluesky882/coarea/backend/api-go/internal/redisclient"
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

	// Active OTP provider — swap by changing this one line. Email (Resend)
	// is active to avoid per-message SMS cost while volume is low. Both
	// SMS paths are fully built and one line away:
	//   otp.NewSMSMKTOTPProvider(cfg.SMSMKTAPIKey, cfg.SMSMKTSecretKey, cfg.SMSMKTProjectKey)
	//   otp.NewSelfGenProvider(sms.NewClient(...)/sms.NewSMSMKTClient(...), 5*time.Minute)
	otpProvider := otp.NewEmailOTPProvider(email.NewClient(cfg.ResendAPIKey, cfg.EmailFrom), 5*time.Minute)
	otpService := otp.NewService(redisClient, otpProvider)
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
