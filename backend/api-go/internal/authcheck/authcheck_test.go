package authcheck

import (
	"testing"
	"time"
)

// Regression tests for the bug where the session cache used a flat 60s
// TTL regardless of the session's real expiry: a session naturally
// expiring sooner than cacheTTL after being cached would keep
// authenticating from cache past its real expiry.
func TestCappedCacheTTL(t *testing.T) {
	now := time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)
	base := 60 * time.Second

	t.Run("caps to the session's remaining lifetime when it expires sooner than base", func(t *testing.T) {
		expiresAt := now.Add(10 * time.Second)
		got := cappedCacheTTL(expiresAt, now, base)
		if got != 10*time.Second {
			t.Fatalf("expected ttl capped to 10s, got %v", got)
		}
	})

	t.Run("uses base when the session outlives it", func(t *testing.T) {
		expiresAt := now.Add(time.Hour)
		got := cappedCacheTTL(expiresAt, now, base)
		if got != base {
			t.Fatalf("expected ttl to be base (%v), got %v", base, got)
		}
	})

	t.Run("returns non-positive for an already-expired session so callers skip caching", func(t *testing.T) {
		expiresAt := now.Add(-time.Second)
		got := cappedCacheTTL(expiresAt, now, base)
		if got > 0 {
			t.Fatalf("expected a non-positive ttl for an expired session, got %v", got)
		}
	})

	t.Run("exact boundary: expiry equal to base returns base", func(t *testing.T) {
		expiresAt := now.Add(base)
		got := cappedCacheTTL(expiresAt, now, base)
		if got != base {
			t.Fatalf("expected ttl to equal base at the boundary, got %v", got)
		}
	})
}
