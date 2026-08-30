// Package authcheck verifies Bearer tokens against the "session"/"user"
// tables backend/better-auth owns (same physical Postgres database) — see
// DECISIONS.md → "Backend Domain Ownership — TypeScript Is Auth-Only".
// Read-only: this service never writes to those tables.
package authcheck

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/uptrace/bun"
)

type User struct {
	ID       string
	Name     string
	Verified bool
}

// cacheTTL bounds how stale a cached session can be — every request in
// this service goes through UserForToken, so caching the Postgres lookup
// is both the "cache" and "session store" use cases at once. Deliberately
// short: a revoked session (logout, ban) can still authenticate for up to
// this long after cache-population, which is an accepted tradeoff at this
// stage rather than adding cache invalidation on session delete.
const cacheTTL = 60 * time.Second

var cache *redis.Client

// SetCache wires a Redis client into authcheck for session-token caching.
// Not calling it (rdb stays nil) just means every call hits Postgres
// directly, same as before Redis existed — safe for local dev without
// Redis running.
func SetCache(rdb *redis.Client) { cache = rdb }

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

	cacheKey := "session:" + token
	if cache != nil {
		if raw, err := cache.Get(ctx, cacheKey).Result(); err == nil {
			var u User
			if json.Unmarshal([]byte(raw), &u) == nil {
				return u, true
			}
		}
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

	if cache != nil {
		if raw, err := json.Marshal(u); err == nil {
			if err := cache.Set(ctx, cacheKey, raw, cacheTTL).Err(); err != nil {
				log.Printf("authcheck: cache write failed: %v", err)
			}
		}
	}
	return u, true
}
