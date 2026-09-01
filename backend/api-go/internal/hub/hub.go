// Package hub is a room broadcaster for websocket clients. Local delivery
// (the map below) always happens on whichever instance a client is
// connected to; Broadcast additionally publishes through Redis so every
// other instance's subscriber relays the event to its own local clients —
// this is what makes broadcasts (new posts/comments/likes, friend events)
// correct once api-go runs as more than one replica. The raw client-to-
// client relay used by Join/broadcast (see stage-10-chat) stays
// local-only: it's an unauthenticated same-process echo, not yet a
// production chat feature, and cross-instance sender-exclusion isn't
// worth the complexity until it is.
package hub

import (
	"context"
	"log"
	"strings"
	"sync"

	"github.com/coder/websocket"
	"github.com/redis/go-redis/v9"
)

// channelPrefix namespaces hub pub/sub traffic within the shared Redis
// instance (other features may use the same Redis for caching/rate
// limiting — see internal/authcheck, internal/ratelimit).
const channelPrefix = "hub:"

type client struct {
	conn *websocket.Conn
	room string
}

type Hub struct {
	mu      sync.RWMutex
	clients map[*client]struct{}
	rdb     *redis.Client
}

// New starts a Hub. rdb may be nil (e.g. local dev without Redis running) —
// Broadcast then falls back to local-only delivery, same as before Redis
// was wired in, just without cross-instance fan-out.
func New(rdb *redis.Client) *Hub {
	h := &Hub{clients: make(map[*client]struct{}), rdb: rdb}
	if rdb != nil {
		go h.subscribeLoop(context.Background())
	}
	return h
}

// subscribeLoop holds one long-lived pub/sub subscription for the life of
// the process. go-redis's PubSub reconnects and resubscribes internally on
// connection errors (Redis restart, network blip) — sub.Channel() only
// closes once sub.Close() is called — so no outer retry loop is needed
// here.
func (h *Hub) subscribeLoop(ctx context.Context) {
	sub := h.rdb.PSubscribe(ctx, channelPrefix+"*")
	defer sub.Close()
	for msg := range sub.Channel() {
		room := strings.TrimPrefix(msg.Channel, channelPrefix)
		h.deliverLocal(ctx, room, []byte(msg.Payload))
	}
}

func (h *Hub) deliverLocal(ctx context.Context, room string, data []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for c := range h.clients {
		if c.room != room {
			continue
		}
		if err := c.conn.Write(ctx, websocket.MessageText, data); err != nil {
			log.Printf("hub: broadcast write failed: %v", err)
		}
	}
}

// Join registers conn under room and blocks, relaying every message it
// receives to the other clients in the same room, until the connection
// closes or ctx is cancelled.
func (h *Hub) Join(ctx context.Context, conn *websocket.Conn, room string) {
	c := &client{conn: conn, room: room}

	h.mu.Lock()
	h.clients[c] = struct{}{}
	h.mu.Unlock()

	defer func() {
		h.mu.Lock()
		delete(h.clients, c)
		h.mu.Unlock()
	}()

	for {
		msgType, data, err := conn.Read(ctx)
		if err != nil {
			return
		}
		h.broadcast(ctx, c, msgType, data)
	}
}

func (h *Hub) broadcast(ctx context.Context, from *client, msgType websocket.MessageType, data []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for c := range h.clients {
		if c == from || c.room != from.room {
			continue
		}
		if err := c.conn.Write(ctx, msgType, data); err != nil {
			log.Printf("hub: write to client failed: %v", err)
		}
	}
}

// Broadcast pushes a server-originated text message (JSON, by convention —
// see internal/feed and internal/friends) to every client currently in
// room, on this instance and (via Redis pub/sub) every other instance.
// Unlike broadcast above, this has no originating client to exclude — it's
// how other packages push real-time events (a new post, a friend request)
// rather than relaying a message a client sent.
func (h *Hub) Broadcast(ctx context.Context, room string, data []byte) {
	if h.rdb == nil {
		h.deliverLocal(ctx, room, data)
		return
	}
	if err := h.rdb.Publish(ctx, channelPrefix+room, data).Err(); err != nil {
		log.Printf("hub: redis publish failed, falling back to local delivery: %v", err)
		h.deliverLocal(ctx, room, data)
	}
}
