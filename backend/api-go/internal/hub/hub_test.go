package hub

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/coder/websocket"
	"github.com/redis/go-redis/v9"
)

// newTestServer wires up an httptest server that accepts a websocket
// connection and registers it with h.Join under room, returning a dialed
// client connection to read from.
func newTestServer(t *testing.T, h *Hub, room string) *websocket.Conn {
	t.Helper()

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := websocket.Accept(w, r, nil)
		if err != nil {
			return
		}
		h.Join(r.Context(), conn, room)
	}))
	t.Cleanup(srv.Close)

	wsURL := "ws" + strings.TrimPrefix(srv.URL, "http")
	conn, _, err := websocket.Dial(context.Background(), wsURL, nil)
	if err != nil {
		t.Fatalf("dial: %v", err)
	}
	t.Cleanup(func() { _ = conn.CloseNow() })

	return conn
}

func readOne(t *testing.T, conn *websocket.Conn, timeout time.Duration) string {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	_, data, err := conn.Read(ctx)
	if err != nil {
		t.Fatalf("read: %v", err)
	}
	return string(data)
}

func TestBroadcast_LocalOnlyWhenRedisNil(t *testing.T) {
	h := New(nil)
	conn := newTestServer(t, h, "room1")

	// give Join a moment to register the client before broadcasting
	time.Sleep(50 * time.Millisecond)
	h.Broadcast(context.Background(), "room1", []byte("hello"))

	if got := readOne(t, conn, 2*time.Second); got != "hello" {
		t.Fatalf("expected %q, got %q", "hello", got)
	}
}

func TestBroadcast_ViaRedisPubSub(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("miniredis.Run: %v", err)
	}
	t.Cleanup(mr.Close)

	rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	t.Cleanup(func() { _ = rdb.Close() })

	h := New(rdb)
	conn := newTestServer(t, h, "room1")

	time.Sleep(100 * time.Millisecond) // let subscribeLoop's PSubscribe establish
	h.Broadcast(context.Background(), "room1", []byte("via-redis"))

	if got := readOne(t, conn, 2*time.Second); got != "via-redis" {
		t.Fatalf("expected %q, got %q", "via-redis", got)
	}
}

// TestBroadcast_SurvivesRedisRestart documents and locks in the actual
// reconnect behavior relied on by subscribeLoop: go-redis's PubSub
// reconnects and resubscribes internally on connection errors (its
// Channel() only ever closes once Close() is called), so a Redis
// restart must not permanently break cross-instance delivery even though
// subscribeLoop itself has no retry loop of its own — see the comment on
// subscribeLoop.
func TestBroadcast_SurvivesRedisRestart(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("miniredis.Run: %v", err)
	}
	t.Cleanup(mr.Close)

	rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	t.Cleanup(func() { _ = rdb.Close() })

	h := New(rdb)
	conn := newTestServer(t, h, "room1")

	time.Sleep(100 * time.Millisecond)
	h.Broadcast(context.Background(), "room1", []byte("before-restart"))
	if got := readOne(t, conn, 2*time.Second); got != "before-restart" {
		t.Fatalf("expected %q, got %q", "before-restart", got)
	}

	mr.Close()
	time.Sleep(300 * time.Millisecond)
	if err := mr.Restart(); err != nil {
		t.Fatalf("miniredis restart: %v", err)
	}
	time.Sleep(500 * time.Millisecond) // let go-redis's internal reconnect kick in

	h.Broadcast(context.Background(), "room1", []byte("after-restart"))
	if got := readOne(t, conn, 3*time.Second); got != "after-restart" {
		t.Fatalf("expected delivery to resume after Redis restart, got %q", got)
	}
}
