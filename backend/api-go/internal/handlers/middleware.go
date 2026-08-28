package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v3"

	"github.com/onebluesky882/coarea/backend/api-go/internal/authtoken"
)

// RequireAuth enforces Bearer-token auth per SECURITY_RULES.md (no
// cookies). On success it stashes the parsed claims on the request
// context under "user" for downstream handlers.
func RequireAuth(issuer *authtoken.Issuer) fiber.Handler {
	return func(c fiber.Ctx) error {
		header := c.Get("Authorization")
		const prefix = "Bearer "
		if !strings.HasPrefix(header, prefix) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing bearer token"})
		}

		claims, err := issuer.Verify(strings.TrimPrefix(header, prefix))
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid or expired token"})
		}

		c.Locals("user", claims)
		return c.Next()
	}
}
