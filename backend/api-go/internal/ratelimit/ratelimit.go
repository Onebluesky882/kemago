// Package ratelimit implements a fixed-window request counter backed by
// Redis, shared across every api-go instance. A nil client (Redis not
// configured) makes Allow always report allowed — rate limiting degrades
// to "off" rather than blocking requests when Redis isn't reachable.
package ratelimit

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

// Allow reports whether one more action under key is allowed within the
// current window. key should already identify the specific action and
// actor (e.g. "ratelimit:post:" + userID) — this package does no scoping
// of its own.
func Allow(ctx context.Context, rdb *redis.Client, key string, limit int, window time.Duration) bool {
	if rdb == nil {
		return true
	}

	count, err := rdb.Incr(ctx, key).Result()
	if err != nil {
		log.Printf("ratelimit: redis incr failed, allowing request: %v", err)
		return true
	}
	if count == 1 {
		if err := rdb.Expire(ctx, key, window).Err(); err != nil {
			log.Printf("ratelimit: redis expire failed: %v", err)
		}
	}
	return count <= int64(limit)
}
