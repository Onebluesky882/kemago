package handlers

import (
	"github.com/gofiber/fiber/v3"

	"github.com/onebluesky882/coarea/backend/api-go/internal/authtoken"
)

// Me is a minimal protected-route example — confirms RequireAuth actually
// rejects missing/invalid tokens and accepts valid ones end-to-end.
func Me(c fiber.Ctx) error {
	claims, ok := c.Locals("user").(*authtoken.Claims)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "missing claims"})
	}
	return c.JSON(fiber.Map{"user_id": claims.UserID, "identifier": claims.Identifier})
}
