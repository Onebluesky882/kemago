// Package clubs implements the clubs REST API (create/join/leave/reassign
// leader) — see DECISIONS.md → "Backend Domain Ownership — TypeScript Is
// Auth-Only". Mirrors internal/feed's structure: Go 1.22+ ServeMux method+
// wildcard patterns, bun for queries, its own small copies of the
// writeJSON/writeError/writeInternalError helpers (unexported in feed, so
// re-implemented here per that package's own convention).
package clubs

import (
	"context"
	"crypto/rand"
	"database/sql"
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
	mux.HandleFunc("GET /api/clubs", h.listClubs)
	mux.HandleFunc("POST /api/clubs", h.createClub)
	mux.HandleFunc("POST /api/clubs/{id}/join", h.joinClub)
	mux.HandleFunc("POST /api/clubs/{id}/leave", h.leaveClub)
	mux.HandleFunc("PATCH /api/clubs/{id}/leader", h.changeLeader)
	mux.HandleFunc("GET /api/clubs/{id}/members", h.listClubMembers)
}

func newID(prefix string) string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return prefix + "_" + hex.EncodeToString(b)
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"message": message})
}

// writeInternalError logs the real error server-side (see feed.go's copy of
// this helper for the story on why that matters) before sending the client
// a generic message.
func writeInternalError(w http.ResponseWriter, err error) {
	log.Printf("internal error: %v", err)
	writeError(w, http.StatusInternalServerError, "internal error")
}

type clubOut struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	LeaderID    string    `json:"leaderId"`
	LeaderName  string    `json:"leaderName"`
	MemberCount int       `json:"memberCount"`
	Joined      bool      `json:"joined"`
	CreatedAt   time.Time `json:"createdAt"`
}

// pgdriver only binds parameters correctly when queries go through bun's own
// formatter (NewRaw(...).Scan(...) with "?" placeholders) — see feed.go's
// postSelect comment for the full story on why raw "$1"-style placeholders
// fail against this project's pgdriver setup.
//
// clubSelect's first placeholder is always the requesting user's id (empty
// string when unauthenticated, in which case "joined" is always false since
// no row can match an empty user_id).
const clubSelect = `
	SELECT c.id AS id, c.name AS name, c.description AS description, c.category AS category,
		c.leader_id AS leader_id, u.name AS leader_name, c.created_at AS created_at,
		(SELECT count(*) FROM club_members m WHERE m.club_id = c.id) AS member_count,
		(SELECT EXISTS(SELECT 1 FROM club_members m WHERE m.club_id = c.id AND m.user_id = ?)) AS joined
	FROM clubs c
	JOIN "user" u ON u.id = c.leader_id
`

// clubRow's bun tags match clubSelect's column aliases — NewRaw(...).Scan
// maps columns onto these tags the same way Model() does for real tables.
type clubRow struct {
	ID          string    `bun:"id"`
	Name        string    `bun:"name"`
	Description string    `bun:"description"`
	Category    string    `bun:"category"`
	LeaderID    string    `bun:"leader_id"`
	LeaderName  string    `bun:"leader_name"`
	CreatedAt   time.Time `bun:"created_at"`
	MemberCount int       `bun:"member_count"`
	Joined      bool      `bun:"joined"`
}

func (row clubRow) toOut() clubOut {
	return clubOut{
		ID: row.ID, Name: row.Name, Description: row.Description, Category: row.Category,
		LeaderID: row.LeaderID, LeaderName: row.LeaderName, CreatedAt: row.CreatedAt,
		MemberCount: row.MemberCount, Joined: row.Joined,
	}
}

// requesterID reads the Bearer token off r if present, else returns "" —
// used by the GET endpoint, which is readable by anyone but personalizes
// the "joined" flag when the caller happens to be signed in.
func requesterID(ctx context.Context, db *bun.DB, r *http.Request) string {
	user, _ := authcheck.RequireUser(ctx, db, r)
	return user.ID
}

func (h *Handlers) getClubByID(ctx context.Context, id string, requesterID string) (clubOut, error) {
	var row clubRow
	if err := h.DB.NewRaw(clubSelect+` WHERE c.id = ?`, requesterID, id).Scan(ctx, &row); err != nil {
		return clubOut{}, err
	}
	return row.toOut(), nil
}

func (h *Handlers) clubExists(ctx context.Context, id string) (bool, error) {
	_, err := h.getClubByID(ctx, id, "")
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (h *Handlers) listClubs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := requesterID(ctx, h.DB, r)

	var rows []clubRow
	if err := h.DB.NewRaw(clubSelect+` ORDER BY c.created_at DESC`, uid).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}

	out := make([]clubOut, len(rows))
	for i, row := range rows {
		out[i] = row.toOut()
	}
	writeJSON(w, http.StatusOK, map[string]any{"clubs": out})
}

func (h *Handlers) createClub(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var body struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Category    string `json:"category"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		writeError(w, http.StatusUnprocessableEntity, "name is required")
		return
	}

	club := &dbpkg.Club{
		ID: newID("club"), Name: body.Name, Description: body.Description,
		Category: body.Category, LeaderID: user.ID,
	}
	if _, err := h.DB.NewInsert().Model(club).Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	// Creator is a member of their own club.
	if _, err := h.DB.NewInsert().
		Model(&dbpkg.ClubMember{ClubID: club.ID, UserID: user.ID}).
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	created, err := h.getClubByID(ctx, club.ID, user.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"club": created})
}

func (h *Handlers) joinClub(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	clubID := r.PathValue("id")
	exists, err := h.clubExists(ctx, clubID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if !exists {
		writeError(w, http.StatusNotFound, "Club not found")
		return
	}

	if _, err := h.DB.NewInsert().
		Model(&dbpkg.ClubMember{ClubID: clubID, UserID: user.ID}).
		On("CONFLICT (club_id, user_id) DO NOTHING").
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"joined": true})
}

// leaveClub is deliberately simple: a club leader who wants to leave must
// hand off leadership first (PATCH .../leader) — no auto-reassignment, per
// the task's product decision.
func (h *Handlers) leaveClub(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	clubID := r.PathValue("id")
	var club dbpkg.Club
	if err := h.DB.NewSelect().Model(&club).Where("id = ?", clubID).Scan(ctx); err != nil {
		if err == sql.ErrNoRows {
			writeError(w, http.StatusNotFound, "Club not found")
			return
		}
		writeInternalError(w, err)
		return
	}

	if club.LeaderID == user.ID {
		writeError(w, http.StatusUnprocessableEntity, "Leader must hand off leadership before leaving")
		return
	}

	if _, err := h.DB.NewDelete().
		Model((*dbpkg.ClubMember)(nil)).
		Where("club_id = ? AND user_id = ?", clubID, user.ID).
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"joined": false})
}

func (h *Handlers) changeLeader(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	clubID := r.PathValue("id")
	var club dbpkg.Club
	if err := h.DB.NewSelect().Model(&club).Where("id = ?", clubID).Scan(ctx); err != nil {
		if err == sql.ErrNoRows {
			writeError(w, http.StatusNotFound, "Club not found")
			return
		}
		writeInternalError(w, err)
		return
	}

	if club.LeaderID != user.ID {
		writeError(w, http.StatusForbidden, "Only the current leader can hand off leadership")
		return
	}

	var body struct {
		UserID string `json:"userId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.UserID == "" {
		writeError(w, http.StatusUnprocessableEntity, "userId is required")
		return
	}

	isMember, err := h.DB.NewSelect().
		Model((*dbpkg.ClubMember)(nil)).
		Where("club_id = ? AND user_id = ?", clubID, body.UserID).
		Exists(ctx)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if !isMember {
		writeError(w, http.StatusUnprocessableEntity, "New leader must already be a member of the club")
		return
	}

	club.LeaderID = body.UserID
	if _, err := h.DB.NewUpdate().Model(&club).Column("leader_id").WherePK().Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	updated, err := h.getClubByID(ctx, clubID, user.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"club": updated})
}

const clubMemberSelect = `
	SELECT u.id AS id, u.name AS name, u.email_verified AS verified, m.joined_at AS joined_at
	FROM club_members m
	JOIN "user" u ON u.id = m.user_id
	WHERE m.club_id = ?
	ORDER BY m.joined_at ASC
`

type clubMemberRow struct {
	ID       string    `bun:"id"`
	Name     string    `bun:"name"`
	Verified bool      `bun:"verified"`
	JoinedAt time.Time `bun:"joined_at"`
}

type clubMemberOut struct {
	ID       string    `json:"id"`
	Name     string    `json:"name"`
	Verified bool      `json:"verified"`
	JoinedAt time.Time `json:"joinedAt"`
}

// listClubMembers exists mainly so a leader-handoff UI has a member list to
// pick the new leader from — no auth required to view, same as listClubs.
func (h *Handlers) listClubMembers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	clubID := r.PathValue("id")

	var rows []clubMemberRow
	if err := h.DB.NewRaw(clubMemberSelect, clubID).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}
	out := make([]clubMemberOut, len(rows))
	for i, row := range rows {
		out[i] = clubMemberOut{ID: row.ID, Name: row.Name, Verified: row.Verified, JoinedAt: row.JoinedAt}
	}
	writeJSON(w, http.StatusOK, map[string]any{"members": out})
}
