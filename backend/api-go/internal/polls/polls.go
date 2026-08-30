// Package polls implements poll-style posts — a question with vote-able
// options attached to an existing post (see DECISIONS.md → "Backend Domain
// Ownership — TypeScript Is Auth-Only"; this is Go-owned data like the
// rooms/posts/comments/likes domain in internal/feed). One poll per post,
// one vote per user per poll (voting again changes the vote).
//
// Mirrors internal/feed/feed.go's conventions: Go 1.22+ ServeMux
// method+wildcard patterns, and raw SQL routed through
// db.NewRaw(query, args...).Scan(ctx, &dest) with "?" placeholders rather
// than the embedded *sql.DB's QueryContext/QueryRowContext directly —
// pgdriver rejects "$1"-style placeholders sent via the simple protocol
// (see feed.go's postSelect comment for the full explanation).
package polls

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/uptrace/bun"

	"github.com/onebluesky882/kemago/backend/api-go/internal/authcheck"
	dbpkg "github.com/onebluesky882/kemago/backend/api-go/internal/db"
)

type Handlers struct {
	DB *bun.DB
}

func Register(mux *http.ServeMux, database *bun.DB) {
	h := &Handlers{DB: database}
	mux.HandleFunc("POST /api/posts/{id}/poll", h.createPoll)
	mux.HandleFunc("GET /api/posts/{id}/poll", h.getPoll)
	mux.HandleFunc("POST /api/posts/{id}/poll/vote", h.votePoll)
}

func newID(prefix string) string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return prefix + "_" + hex.EncodeToString(b)
}

// writeJSON/writeError/writeInternalError are re-implemented locally per the
// existing per-package convention (each feature package keeps its own
// unexported copies rather than importing another package's) — see
// feed.go's identical trio.
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

func (h *Handlers) postExists(ctx context.Context, id string) (bool, error) {
	var exists int
	err := h.DB.NewRaw(`SELECT 1 FROM posts WHERE id = ?`, id).Scan(ctx, &exists)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

type pollOptionOut struct {
	ID        string `json:"id"`
	Label     string `json:"label"`
	VoteCount int    `json:"voteCount"`
}

type pollOut struct {
	ID             string          `json:"id"`
	PostID         string          `json:"postId"`
	Question       string          `json:"question"`
	Options        []pollOptionOut `json:"options"`
	TotalVotes     int             `json:"totalVotes"`
	MyVoteOptionID *string         `json:"myVoteOptionId"`
}

type pollRow struct {
	ID       string `bun:"id"`
	PostID   string `bun:"post_id"`
	Question string `bun:"question"`
}

const pollSelect = `SELECT id, post_id, question FROM polls WHERE post_id = ?`

func (h *Handlers) getPollByPostID(ctx context.Context, postID string) (pollRow, error) {
	var row pollRow
	if err := h.DB.NewRaw(pollSelect, postID).Scan(ctx, &row); err != nil {
		return pollRow{}, err
	}
	return row, nil
}

type pollOptionRow struct {
	ID        string `bun:"id"`
	Label     string `bun:"label"`
	VoteCount int    `bun:"vote_count"`
}

// vote_count subquery mirrors feed.go's postSelect like_count pattern.
const pollOptionsSelect = `
	SELECT po.id AS id, po.label AS label,
		(SELECT count(*) FROM poll_votes pv WHERE pv.option_id = po.id) AS vote_count
	FROM poll_options po
	WHERE po.poll_id = ?
	ORDER BY po.position ASC
`

func (h *Handlers) createPoll(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if _, ok := authcheck.RequireUser(ctx, h.DB, r); !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	postID := r.PathValue("id")
	exists, err := h.postExists(ctx, postID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if !exists {
		writeError(w, http.StatusNotFound, "Post not found")
		return
	}

	var body struct {
		Question string   `json:"question"`
		Options  []string `json:"options"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusUnprocessableEntity, "question and at least 2 options are required")
		return
	}

	question := strings.TrimSpace(body.Question)
	var labels []string
	for _, opt := range body.Options {
		if trimmed := strings.TrimSpace(opt); trimmed != "" {
			labels = append(labels, trimmed)
		}
	}
	if question == "" || len(labels) < 2 {
		writeError(w, http.StatusUnprocessableEntity, "question and at least 2 non-empty options are required")
		return
	}

	poll := &dbpkg.Poll{ID: newID("poll"), PostID: postID, Question: question}
	if _, err := h.DB.NewInsert().Model(poll).Exec(ctx); err != nil {
		// The existence check above already ruled out a missing/invalid
		// post, so any error here is treated as "this post already has a
		// poll" (the polls.post_id UNIQUE constraint) rather than a 500 —
		// see task notes on converting that constraint violation to a
		// clean 422.
		log.Printf("createPoll: insert poll failed (treating as duplicate poll): %v", err)
		writeError(w, http.StatusUnprocessableEntity, "This post already has a poll")
		return
	}

	options := make([]*dbpkg.PollOption, len(labels))
	for i, label := range labels {
		options[i] = &dbpkg.PollOption{ID: newID("option"), PollID: poll.ID, Label: label, Position: i}
	}
	if _, err := h.DB.NewInsert().Model(&options).Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	out := pollOut{
		ID:         poll.ID,
		PostID:     poll.PostID,
		Question:   poll.Question,
		Options:    make([]pollOptionOut, len(options)),
		TotalVotes: 0,
	}
	for i, opt := range options {
		out.Options[i] = pollOptionOut{ID: opt.ID, Label: opt.Label, VoteCount: 0}
	}
	writeJSON(w, http.StatusCreated, map[string]any{"poll": out})
}

func (h *Handlers) getPoll(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	postID := r.PathValue("id")

	poll, err := h.getPollByPostID(ctx, postID)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "This post has no poll")
		return
	}
	if err != nil {
		writeInternalError(w, err)
		return
	}

	var optionRows []pollOptionRow
	if err := h.DB.NewRaw(pollOptionsSelect, poll.ID).Scan(ctx, &optionRows); err != nil {
		writeInternalError(w, err)
		return
	}

	total := 0
	options := make([]pollOptionOut, len(optionRows))
	for i, row := range optionRows {
		options[i] = pollOptionOut{ID: row.ID, Label: row.Label, VoteCount: row.VoteCount}
		total += row.VoteCount
	}

	// myVoteOptionId only gets populated when a valid Bearer token is
	// present — an anonymous GET still returns the poll, just without it.
	var myVoteOptionID *string
	if user, ok := authcheck.RequireUser(ctx, h.DB, r); ok {
		var optionID string
		err := h.DB.NewRaw(`SELECT option_id FROM poll_votes WHERE poll_id = ? AND user_id = ?`, poll.ID, user.ID).
			Scan(ctx, &optionID)
		if err == nil {
			myVoteOptionID = &optionID
		} else if err != sql.ErrNoRows {
			writeInternalError(w, err)
			return
		}
	}

	out := pollOut{
		ID: poll.ID, PostID: poll.PostID, Question: poll.Question,
		Options: options, TotalVotes: total, MyVoteOptionID: myVoteOptionID,
	}
	writeJSON(w, http.StatusOK, map[string]any{"poll": out})
}

func (h *Handlers) votePoll(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	postID := r.PathValue("id")
	poll, err := h.getPollByPostID(ctx, postID)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "This post has no poll")
		return
	}
	if err != nil {
		writeInternalError(w, err)
		return
	}

	var body struct {
		OptionID string `json:"optionId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.OptionID == "" {
		writeError(w, http.StatusUnprocessableEntity, "optionId is required")
		return
	}

	var optionPollID string
	err = h.DB.NewRaw(`SELECT poll_id FROM poll_options WHERE id = ?`, body.OptionID).Scan(ctx, &optionPollID)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "Option not found")
		return
	}
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if optionPollID != poll.ID {
		writeError(w, http.StatusUnprocessableEntity, "Option does not belong to this poll")
		return
	}

	// Upsert on the (poll_id, user_id) composite PK: voting again replaces
	// the caller's previous choice for this poll rather than erroring or
	// adding a second row.
	if _, err := h.DB.NewInsert().
		Model(&dbpkg.PollVote{PollID: poll.ID, OptionID: body.OptionID, UserID: user.ID}).
		On("CONFLICT (poll_id, user_id) DO UPDATE").
		Set("option_id = EXCLUDED.option_id").
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"optionId": body.OptionID})
}
