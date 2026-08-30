// Package authcheck verifies Bearer tokens against the "session"/"user"
// tables backend/better-auth owns (same physical Postgres database) — see
// DECISIONS.md → "Backend Domain Ownership — TypeScript Is Auth-Only".
// Read-only: this service never writes to those tables.
package authcheck

import (
	"context"
	"net/http"
	"strings"

	"github.com/uptrace/bun"
)

type User struct {
	ID       string
	Name     string
	Verified bool
}

// RequireUser reads the Bearer token off r, and returns the signed-in user
// if the session is valid and not expired. ok is false on any missing,
// malformed, unknown, or expired token — callers should respond 401.
func RequireUser(ctx context.Context, db *bun.DB, r *http.Request) (User, bool) {
	header := r.Header.Get("Authorization")
	token, hasBearer := strings.CutPrefix(header, "Bearer ")
	if !hasBearer || token == "" {
		return User{}, false
	}
	return UserForToken(ctx, db, token)
}

// UserForToken verifies a raw session token directly, for callers that
// don't have a normal Authorization header to read one from — the
// websocket upgrade request (internal/hub, via ?token=) is the only one
// today, since browsers/RN's WebSocket client can't set custom headers.
func UserForToken(ctx context.Context, db *bun.DB, token string) (User, bool) {
	if token == "" {
		return User{}, false
	}

	var u User
	err := db.NewRaw(`
		SELECT u.id, u.name, u.email_verified
		FROM session s
		JOIN "user" u ON u.id = s.user_id
		WHERE s.token = ? AND s.expires_at > now()
	`, token).Scan(ctx, &u.ID, &u.Name, &u.Verified)
	if err != nil {
		return User{}, false
	}
	return u, true
}
