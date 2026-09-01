package ratelimit

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

func newTestClient(t *testing.T) (*redis.Client, *miniredis.Miniredis) {
	t.Helper()
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("miniredis.Run: %v", err)
	}
	t.Cleanup(mr.Close)
	rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	t.Cleanup(func() { _ = rdb.Close() })
	return rdb, mr
}

func TestAllow_NilClientAlwaysAllows(t *testing.T) {
	ctx := context.Background()
	for i := 0; i < 5; i++ {
		if !Allow(ctx, nil, "key", 1, time.Minute) {
			t.Fatalf("Allow with nil client should always report allowed")
		}
	}
}

func TestAllow_LimitEnforced(t *testing.T) {
	rdb, _ := newTestClient(t)
	ctx := context.Background()
	key := "ratelimit:test:enforced"

	for i := 0; i < 3; i++ {
		if !Allow(ctx, rdb, key, 3, time.Minute) {
			t.Fatalf("request %d should be allowed within limit 3", i+1)
		}
	}
	if Allow(ctx, rdb, key, 3, time.Minute) {
		t.Fatalf("4th request should be denied once the limit of 3 is exceeded")
	}
}

func TestAllow_IndependentKeys(t *testing.T) {
	rdb, _ := newTestClient(t)
	ctx := context.Background()

	if !Allow(ctx, rdb, "ratelimit:test:userA", 1, time.Minute) {
		t.Fatalf("first request for userA should be allowed")
	}
	if Allow(ctx, rdb, "ratelimit:test:userA", 1, time.Minute) {
		t.Fatalf("second request for userA should be denied (limit 1)")
	}
	if !Allow(ctx, rdb, "ratelimit:test:userB", 1, time.Minute) {
		t.Fatalf("userB's own counter must not be affected by userA's usage")
	}
}

// TestAllow_SetsTTLAtomically is a regression test for the bug where INCR
// and EXPIRE were two separate Redis round-trips: if EXPIRE failed right
// after the first INCR, the key would keep incrementing forever with no
// TTL, permanently rate-limiting the actor. Allow now applies both via one
// atomic Lua script, so the key must always carry a TTL as soon as it's
// created.
func TestAllow_SetsTTLAtomically(t *testing.T) {
	rdb, mr := newTestClient(t)
	ctx := context.Background()
	key := "ratelimit:test:ttl"

	if !Allow(ctx, rdb, key, 5, 30*time.Second) {
		t.Fatalf("first request should be allowed")
	}

	ttl := mr.TTL(key)
	if ttl <= 0 {
		t.Fatalf("expected key %q to have a positive TTL right after the first increment, got %v", key, ttl)
	}
	if ttl > 30*time.Second {
		t.Fatalf("expected TTL to be capped at the requested window (30s), got %v", ttl)
	}
}

func TestAllow_ResetsAfterWindowExpires(t *testing.T) {
	rdb, mr := newTestClient(t)
	ctx := context.Background()
	key := "ratelimit:test:window"

	if !Allow(ctx, rdb, key, 1, 10*time.Second) {
		t.Fatalf("first request should be allowed")
	}
	if Allow(ctx, rdb, key, 1, 10*time.Second) {
		t.Fatalf("second request within the window should be denied")
	}

	mr.FastForward(11 * time.Second)

	if !Allow(ctx, rdb, key, 1, 10*time.Second) {
		t.Fatalf("request after the window has elapsed should be allowed again")
	}
}

func TestAllow_RedisErrorFailsOpen(t *testing.T) {
	rdb, mr := newTestClient(t)
	ctx := context.Background()

	mr.Close() // simulate Redis being unreachable

	if !Allow(ctx, rdb, "ratelimit:test:down", 1, time.Minute) {
		t.Fatalf("Allow should fail open (report allowed) when Redis is unreachable")
	}
}
