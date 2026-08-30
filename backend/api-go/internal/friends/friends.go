// Package friends implements a mutual friend-request flow (send, accept,
// decline, remove, list) — see DECISIONS.md → "Backend Domain Ownership —
// TypeScript Is Auth-Only" and internal/feed/feed.go for the conventions
// this package follows (Go 1.22+ ServeMux patterns, Bearer auth via
// authcheck, raw SQL through db.NewRaw with "?" placeholders).
package friends

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/uptrace/bun"

	"github.com/onebluesky882/kemago/backend/api-go/internal/authcheck"
	dbpkg "github.com/onebluesky882/kemago/backend/api-go/internal/db"
	"github.com/onebluesky882/kemago/backend/api-go/internal/hub"
	"github.com/onebluesky882/kemago/backend/api-go/internal/notifications"
)

type Handlers struct {
	DB  *bun.DB
	Hub *hub.Hub
}

func Register(mux *http.ServeMux, database *bun.DB, wsHub *hub.Hub) {
	h := &Handlers{DB: database, Hub: wsHub}
	mux.HandleFunc("POST /api/friends/requests", h.sendRequest)
	mux.HandleFunc("POST /api/friends/requests/{userId}/accept", h.acceptRequest)
	mux.HandleFunc("POST /api/friends/requests/{userId}/decline", h.declineRequest)
	mux.HandleFunc("GET /api/friends/requests", h.listIncomingRequests)
	mux.HandleFunc("DELETE /api/friends/{userId}", h.removeFriend)
	mux.HandleFunc("GET /api/friends", h.listFriends)
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

// notify pushes a real-time event to userID's personal channel (see
// internal/hub and main.go's /ws?token= handling) — best-effort, same
// reasoning as internal/feed's broadcast helper.
func (h *Handlers) notify(ctx context.Context, userID string, event map[string]any) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("notify marshal: %v", err)
		return
	}
	h.Hub.Broadcast(ctx, "user:"+userID, data)
}

func (h *Handlers) sendRequest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var body struct {
		UserID string `json:"userId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.UserID == "" {
		writeError(w, http.StatusUnprocessableEntity, "userId is required")
		return
	}
	if body.UserID == user.ID {
		writeError(w, http.StatusUnprocessableEntity, "cannot friend yourself")
		return
	}

	// Check both directions: an existing row either way means "already
	// friends", "you already sent one", or — the interesting case — "they
	// already requested you", which this call resolves by accepting
	// instead of creating a second, redundant row.
	var existing dbpkg.Friendship
	err := h.DB.NewSelect().Model(&existing).
		Where("(requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)",
			user.ID, body.UserID, body.UserID, user.ID).
		Scan(ctx)

	switch {
	case err == nil && existing.Status == "accepted":
		writeError(w, http.StatusUnprocessableEntity, "already friends")
		return
	case err == nil && existing.RequesterID == user.ID:
		writeError(w, http.StatusUnprocessableEntity, "friend request already sent")
		return
	case err == nil:
		// They requested first — mutual request, accept immediately.
		if _, err := h.DB.NewUpdate().Model(&dbpkg.Friendship{}).
			Set("status = ?, updated_at = now()", "accepted").
			Where("requester_id = ? AND addressee_id = ?", existing.RequesterID, existing.AddresseeID).
			Exec(ctx); err != nil {
			writeInternalError(w, err)
			return
		}
		// existing.RequesterID is the other user — they requested us first,
		// so this "add friend" call is really us accepting theirs.
		h.notify(ctx, existing.RequesterID, map[string]any{
			"type": "friend_accepted",
			"by":   map[string]string{"userId": user.ID, "name": user.Name},
		})
		notifications.Push(ctx, h.DB, existing.RequesterID, "friend_accepted", user.ID, user.Name, nil)
		writeJSON(w, http.StatusOK, map[string]string{"userId": body.UserID, "status": "accepted"})
		return
	case err != sql.ErrNoRows:
		writeInternalError(w, err)
		return
	}

	if _, err := h.DB.NewInsert().
		Model(&dbpkg.Friendship{RequesterID: user.ID, AddresseeID: body.UserID}).
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	h.notify(ctx, body.UserID, map[string]any{
		"type": "friend_request",
		"from": map[string]string{"userId": user.ID, "name": user.Name},
	})
	notifications.Push(ctx, h.DB, body.UserID, "friend_request", user.ID, user.Name, nil)
	writeJSON(w, http.StatusCreated, map[string]string{"userId": body.UserID, "status": "pending"})
}

func (h *Handlers) acceptRequest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	requesterID := r.PathValue("userId")
	res, err := h.DB.NewUpdate().Model(&dbpkg.Friendship{}).
		Set("status = ?, updated_at = now()", "accepted").
		Where("requester_id = ? AND addressee_id = ? AND status = ?", requesterID, user.ID, "pending").
		Exec(ctx)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if n, _ := res.RowsAffected(); n == 0 {
		writeError(w, http.StatusNotFound, "No pending request from this user")
		return
	}
	h.notify(ctx, requesterID, map[string]any{
		"type": "friend_accepted",
		"by":   map[string]string{"userId": user.ID, "name": user.Name},
	})
	notifications.Push(ctx, h.DB, requesterID, "friend_accepted", user.ID, user.Name, nil)
	writeJSON(w, http.StatusOK, map[string]string{"userId": requesterID, "status": "accepted"})
}

func (h *Handlers) declineRequest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	requesterID := r.PathValue("userId")
	if _, err := h.DB.NewDelete().Model((*dbpkg.Friendship)(nil)).
		Where("requester_id = ? AND addressee_id = ? AND status = ?", requesterID, user.ID, "pending").
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"userId": requesterID, "status": "declined"})
}

func (h *Handlers) removeFriend(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	targetID := r.PathValue("userId")
	// Either direction — this also lets a caller cancel a pending request
	// they sent, not just remove an accepted friendship.
	if _, err := h.DB.NewDelete().Model((*dbpkg.Friendship)(nil)).
		Where("(requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)",
			user.ID, targetID, targetID, user.ID).
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"userId": targetID, "status": "removed"})
}

const incomingSelect = `
	SELECT f.requester_id AS user_id, u.name AS name, u.email_verified AS verified, f.created_at AS created_at
	FROM friendships f
	JOIN "user" u ON u.id = f.requester_id
	WHERE f.addressee_id = ? AND f.status = 'pending'
	ORDER BY f.created_at DESC
`

type requestRow struct {
	UserID    string    `bun:"user_id"`
	Name      string    `bun:"name"`
	Verified  bool      `bun:"verified"`
	CreatedAt time.Time `bun:"created_at"`
}

type requestOut struct {
	UserID    string    `json:"userId"`
	Name      string    `json:"name"`
	Verified  bool      `json:"verified"`
	CreatedAt time.Time `json:"createdAt"`
}

func (h *Handlers) listIncomingRequests(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var rows []requestRow
	if err := h.DB.NewRaw(incomingSelect, user.ID).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}

	out := make([]requestOut, len(rows))
	for i, row := range rows {
		out[i] = requestOut{UserID: row.UserID, Name: row.Name, Verified: row.Verified, CreatedAt: row.CreatedAt}
	}
	writeJSON(w, http.StatusOK, map[string]any{"requests": out})
}

const friendsSelect = `
	SELECT u.id AS user_id, u.name AS name, u.email_verified AS verified, f.updated_at AS created_at
	FROM friendships f
	JOIN "user" u ON u.id = CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END
	WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'
	ORDER BY f.updated_at DESC
`

func (h *Handlers) listFriends(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var rows []requestRow
	if err := h.DB.NewRaw(friendsSelect, user.ID, user.ID, user.ID).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}

	out := make([]requestOut, len(rows))
	for i, row := range rows {
		out[i] = requestOut{UserID: row.UserID, Name: row.Name, Verified: row.Verified, CreatedAt: row.CreatedAt}
	}
	writeJSON(w, http.StatusOK, map[string]any{"friends": out})
}
