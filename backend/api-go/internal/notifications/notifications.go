// Package notifications persists a record of things that happened to a
// user (friend request/accept, a comment or like on their post) so they
// aren't lost if the recipient wasn't connected to the websocket hub when
// it happened — internal/friends and internal/feed already push a live
// event over the hub for a connected client; this package is the
// catch-up/history path, read via GET /api/notifications.
package notifications

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/uptrace/bun"

	"github.com/onebluesky882/kemago/backend/api-go/internal/authcheck"
	dbpkg "github.com/onebluesky882/kemago/backend/api-go/internal/db"
)

type Handlers struct {
	DB *bun.DB
}

func Register(mux *http.ServeMux, database *bun.DB) {
	h := &Handlers{DB: database}
	mux.HandleFunc("GET /api/notifications", h.list)
	mux.HandleFunc("GET /api/notifications/unread-count", h.unreadCount)
	mux.HandleFunc("POST /api/notifications/{id}/read", h.markRead)
	mux.HandleFunc("POST /api/notifications/read-all", h.markAllRead)
}

func newID(prefix string) string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return prefix + "_" + hex.EncodeToString(b)
}

// Push persists one notification for recipientID. Best-effort and
// fire-and-forget, same convention as internal/feed's broadcast and
// internal/friends' notify — a failure here logs but never fails the
// caller's request, since the notification is secondary to the action
// that triggered it (the comment/like/friend-request itself already
// succeeded by the time this is called). Silently skips self-notifications
// (e.g. commenting on your own post).
func Push(ctx context.Context, db *bun.DB, recipientID, kind, actorID, actorName string, postID *string) {
	if recipientID == actorID {
		return
	}
	n := &dbpkg.Notification{
		ID:        newID("notif"),
		UserID:    recipientID,
		Kind:      kind,
		ActorID:   actorID,
		ActorName: actorName,
		PostID:    postID,
	}
	if _, err := db.NewInsert().Model(n).Exec(ctx); err != nil {
		log.Printf("notifications: push failed: %v", err)
	}
}

type notificationRow struct {
	ID        string     `bun:"id"`
	Kind      string     `bun:"kind"`
	ActorID   string     `bun:"actor_id"`
	ActorName string     `bun:"actor_name"`
	PostID    *string    `bun:"post_id"`
	ReadAt    *time.Time `bun:"read_at"`
	CreatedAt time.Time  `bun:"created_at"`
}

type notificationOut struct {
	ID        string    `json:"id"`
	Kind      string    `json:"kind"`
	ActorID   string    `json:"actorId"`
	ActorName string    `json:"actorName"`
	PostID    *string   `json:"postId,omitempty"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"createdAt"`
}

const listSelect = `
	SELECT id, kind, actor_id, actor_name, post_id, read_at, created_at
	FROM notifications
	WHERE user_id = ?
	ORDER BY created_at DESC
	LIMIT 50
`

func (h *Handlers) list(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var rows []notificationRow
	if err := h.DB.NewRaw(listSelect, user.ID).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}

	out := make([]notificationOut, len(rows))
	unread := 0
	for i, row := range rows {
		out[i] = notificationOut{
			ID: row.ID, Kind: row.Kind, ActorID: row.ActorID, ActorName: row.ActorName,
			PostID: row.PostID, Read: row.ReadAt != nil, CreatedAt: row.CreatedAt,
		}
		if row.ReadAt == nil {
			unread++
		}
	}
	writeJSON(w, http.StatusOK, map[string]any{"notifications": out, "unreadCount": unread})
}

// unreadCount is a lightweight companion to list for callers (the mobile
// notification bell) that only need the badge number, not the full
// history — avoids fetching and serializing up to 50 rows on every
// mount/realtime nudge just to read one field off the response.
func (h *Handlers) unreadCount(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var count int
	if err := h.DB.NewRaw(
		`SELECT COUNT(*) FROM notifications WHERE user_id = ? AND read_at IS NULL`,
		user.ID,
	).Scan(ctx, &count); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]int{"unreadCount": count})
}

func (h *Handlers) markRead(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id := r.PathValue("id")
	res, err := h.DB.NewUpdate().Model((*dbpkg.Notification)(nil)).
		Set("read_at = now()").
		Where("id = ? AND user_id = ? AND read_at IS NULL", id, user.ID).
		Exec(ctx)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if n, _ := res.RowsAffected(); n == 0 {
		writeError(w, http.StatusNotFound, "Notification not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"id": id, "status": "read"})
}

func (h *Handlers) markAllRead(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if _, err := h.DB.NewUpdate().Model((*dbpkg.Notification)(nil)).
		Set("read_at = now()").
		Where("user_id = ? AND read_at IS NULL", user.ID).
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "read"})
}

// Per-package convention (see internal/feed/feed.go) — each domain package
// keeps its own tiny copies of these JSON response helpers.
func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"message": message})
}

func writeInternalError(w http.ResponseWriter, err error) {
	log.Printf("internal error: %v", err)
	writeError(w, http.StatusInternalServerError, "internal error")
}
