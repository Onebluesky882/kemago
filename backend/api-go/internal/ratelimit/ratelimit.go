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

// allowScript runs INCR+EXPIRE as one atomic Redis-side operation so a
// dropped connection between two separate round-trips can never leave the
// counter incremented with no TTL set (which would rate-limit the actor
// forever, since nothing would ever reset the count).
var allowScript = redis.NewScript(`
local count = redis.call("INCR", KEYS[1])
if count == 1 then
	redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return count
`)

// Allow reports whether one more action under key is allowed within the
// current window. key should already identify the specific action and
// actor (e.g. "ratelimit:post:" + userID) — this package does no scoping
// of its own.
func Allow(ctx context.Context, rdb *redis.Client, key string, limit int, window time.Duration) bool {
	if rdb == nil {
		return true
	}

	count, err := allowScript.Run(ctx, rdb, []string{key}, int64(window.Seconds())).Int64()
	if err != nil {
		log.Printf("ratelimit: redis script failed, allowing request: %v", err)
		return true
	}
	return count <= int64(limit)
}
