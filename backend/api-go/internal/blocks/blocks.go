// Package blocks implements the block/unblock/list-blocked REST API and
// exposes BlockedIDs — the primitive a future integration in
// internal/feed's post-listing query calls to exclude posts authored by
// anyone the caller has blocked. See DECISIONS.md → "Backend Domain
// Ownership — TypeScript Is Auth-Only" and internal/feed/feed.go for the
// conventions this package follows (Go 1.22+ ServeMux patterns, Bearer auth
// via authcheck, raw SQL through db.NewRaw with "?" placeholders).
package blocks

import (
	"context"
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

// Register wires the block/unblock/list-blocked HTTP endpoints onto mux.
// Not called from main.go by this change — the integrator wires it in
// alongside feed.Register once the feed-filtering integration lands.
func Register(mux *http.ServeMux, database *bun.DB) {
	h := &Handlers{DB: database}
	mux.HandleFunc("POST /api/blocks", h.blockUser)
	mux.HandleFunc("DELETE /api/blocks/{userId}", h.unblockUser)
	mux.HandleFunc("GET /api/blocks", h.listBlocked)
}

// Per-package convention (see internal/feed/feed.go) — each domain package
// keeps its own tiny copies of these JSON response helpers rather than
// sharing a common util package.
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

// BlockedIDs returns the list of user IDs that userID has blocked. This is
// the reusable, non-HTTP integration point: the feed domain's post-listing
// query calls this to exclude posts authored by anyone in the caller's
// block list. Exported specifically for that purpose.
func BlockedIDs(ctx context.Context, database *bun.DB, userID string) ([]string, error) {
	var ids []string
	if err := database.NewRaw(`SELECT blocked_id FROM blocks WHERE blocker_id = ?`, userID).Scan(ctx, &ids); err != nil {
		return nil, err
	}
	return ids, nil
}

func (h *Handlers) blockUser(w http.ResponseWriter, r *http.Request) {
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
		writeError(w, http.StatusUnprocessableEntity, "cannot block yourself")
		return
	}

	if _, err := h.DB.NewInsert().
		Model(&dbpkg.Block{BlockerID: user.ID, BlockedID: body.UserID}).
		On("CONFLICT (blocker_id, blocked_id) DO NOTHING").
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"blocked": true})
}

func (h *Handlers) unblockUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	targetID := r.PathValue("userId")
	if _, err := h.DB.NewDelete().
		Model((*dbpkg.Block)(nil)).
		Where("blocker_id = ? AND blocked_id = ?", user.ID, targetID).
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"blocked": false})
}

const blockedSelect = `
	SELECT b.blocked_id AS id, u.name AS name, b.created_at AS blocked_at
	FROM blocks b
	JOIN "user" u ON u.id = b.blocked_id
	WHERE b.blocker_id = ?
	ORDER BY b.created_at DESC
`

// blockedRow's bun tags match blockedSelect's column aliases — same
// NewRaw(...).Scan pattern as internal/feed's postRow/commentRow.
type blockedRow struct {
	ID        string    `bun:"id"`
	Name      string    `bun:"name"`
	BlockedAt time.Time `bun:"blocked_at"`
}

type blockedOut struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	BlockedAt time.Time `json:"blockedAt"`
}

func (h *Handlers) listBlocked(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var rows []blockedRow
	if err := h.DB.NewRaw(blockedSelect, user.ID).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}

	out := make([]blockedOut, len(rows))
	for i, row := range rows {
		out[i] = blockedOut{ID: row.ID, Name: row.Name, BlockedAt: row.BlockedAt}
	}
	writeJSON(w, http.StatusOK, map[string]any{"blocked": out})
}
