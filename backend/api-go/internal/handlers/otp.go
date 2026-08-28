package handlers

import (
	"errors"
	"regexp"

	"github.com/gofiber/fiber/v3"
	"github.com/uptrace/bun"

	"github.com/onebluesky882/coarea/backend/api-go/internal/authtoken"
	"github.com/onebluesky882/coarea/backend/api-go/internal/db"
	"github.com/onebluesky882/coarea/backend/api-go/internal/otp"
)

// The "identifier" field is deliberately provider-agnostic — email today
// (see main.go, active provider is otp.EmailOTPProvider), phone number
// later (otp.SMSMKTOTPProvider / otp.SelfGenProvider are already built).
// This regex validates a plain email address; swap for the phone regex
// this handler used before (^(\+?66|0)\d{9}$) when switching back.
var identifierRe = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

type OTPHandler struct {
	service *otp.Service
	db      *bun.DB
	issuer  *authtoken.Issuer
}

func NewOTPHandler(service *otp.Service, bunDB *bun.DB, issuer *authtoken.Issuer) *OTPHandler {
	return &OTPHandler{service: service, db: bunDB, issuer: issuer}
}

type requestOTPBody struct {
	Identifier string `json:"identifier"`
}

func (h *OTPHandler) Request(c fiber.Ctx) error {
	var body requestOTPBody
	if err := c.Bind().Body(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if !identifierRe.MatchString(body.Identifier) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid email address"})
	}

	if err := h.service.Request(c.Context(), body.Identifier); err != nil {
		if errors.Is(err, otp.ErrCooldown) {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{"error": "please wait before requesting another code"})
		}
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": "failed to send verification code"})
	}

	return c.JSON(fiber.Map{"sent": true})
}

type verifyOTPBody struct {
	Identifier string `json:"identifier"`
	Code       string `json:"code"`
}

func (h *OTPHandler) Verify(c fiber.Ctx) error {
	var body verifyOTPBody
	if err := c.Bind().Body(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	err := h.service.Verify(c.Context(), body.Identifier, body.Code)
	switch {
	case err == nil:
		user, dbErr := db.UpsertVerifiedUser(c.Context(), h.db, body.Identifier)
		if dbErr != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to record verification"})
		}

		token, tokenErr := h.issuer.Issue(user.ID, user.Identifier)
		if tokenErr != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to issue token"})
		}

		return c.JSON(fiber.Map{"verified": true, "token": token})
	case errors.Is(err, otp.ErrIncorrectCode):
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "incorrect code"})
	case errors.Is(err, otp.ErrNotFound):
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "no pending code — request a new one"})
	case errors.Is(err, otp.ErrTooManyAttempts):
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{"error": "too many attempts — request a new code"})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "verification failed"})
	}
}

// DeliveryWebhook receives ThaiBulkSMS's delivery-report callback
// (Transaction, Status, Time — GET/POST/PUT per their dashboard config,
// see developer manual "การสร้าง Webhook"). Only relevant when an SMS
// provider is active; harmless no-op otherwise.
func (h *OTPHandler) DeliveryWebhook(c fiber.Ctx) error {
	transaction := c.Query("Transaction", c.FormValue("Transaction"))
	status := c.Query("Status", c.FormValue("Status"))
	time := c.Query("Time", c.FormValue("Time"))

	// TODO: persist delivery status against the outbound message_id once
	// SMS sends are logged in Postgres, for delivery-rate observability.
	_ = transaction
	_ = status
	_ = time

	return c.SendStatus(fiber.StatusOK)
}
