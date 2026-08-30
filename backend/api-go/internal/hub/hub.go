// Package hub is a minimal in-memory, single-instance room broadcaster for
// chat (see apps/mobile's Chat tab / stage-10-chat). One instance only —
// if api-go is ever scaled beyond one replica, broadcasts need to move
// through Redis pub/sub instead of the in-process map below.
package hub

import (
	"context"
	"log"
	"sync"

	"github.com/coder/websocket"
)

type client struct {
	conn *websocket.Conn
	room string
}

type Hub struct {
	mu      sync.RWMutex
	clients map[*client]struct{}
}

func New() *Hub {
	return &Hub{clients: make(map[*client]struct{})}
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
