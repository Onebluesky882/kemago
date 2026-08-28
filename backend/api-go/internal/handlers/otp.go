package handlers

import (
	"errors"
	"regexp"

	"github.com/gofiber/fiber/v3"

	"github.com/onebluesky882/coarea/backend/api-go/internal/otp"
)

// Thai mobile numbers: 0-prefixed 10 digits (e.g. 0812345678), or the
// international forms ThaiBulkSMS also accepts (66.../+66...) — validated
// loosely here; ThaiBulkSMS itself rejects genuinely invalid numbers
// (ERROR_MSISDN, code 114) and that's surfaced back as a normal error.
var phoneRe = regexp.MustCompile(`^(\+?66|0)\d{9}$`)

type OTPHandler struct {
	service *otp.Service
}

func NewOTPHandler(service *otp.Service) *OTPHandler {
	return &OTPHandler{service: service}
}

type requestOTPBody struct {
	Phone string `json:"phone"`
}

func (h *OTPHandler) Request(c fiber.Ctx) error {
	var body requestOTPBody
	if err := c.Bind().Body(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if !phoneRe.MatchString(body.Phone) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid phone number"})
	}

	if err := h.service.Request(c.Context(), body.Phone); err != nil {
		if errors.Is(err, otp.ErrCooldown) {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{"error": "please wait before requesting another code"})
		}
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": "failed to send verification code"})
	}

	return c.JSON(fiber.Map{"sent": true})
}

type verifyOTPBody struct {
	Phone string `json:"phone"`
	Code  string `json:"code"`
}

func (h *OTPHandler) Verify(c fiber.Ctx) error {
	var body verifyOTPBody
	if err := c.Bind().Body(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	err := h.service.Verify(c.Context(), body.Phone, body.Code)
	switch {
	case err == nil:
		// TODO(stage-5-auth): upsert the user row (mark verified = true)
		// and issue the real Bearer/JWT token here once packages/auth's
		// Go-native equivalent exists (see DECISIONS.md → Coarea Tech Stack).
		return c.JSON(fiber.Map{"verified": true})
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
// see developer manual "การสร้าง Webhook"). This is NOT the OTP send/verify
// flow; it's just delivery-status logging.
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
