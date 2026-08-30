// Package feed implements the rooms/posts/comments/likes REST API — the
// domain data this service owns per DECISIONS.md → "Backend Domain
// Ownership — TypeScript Is Auth-Only". Uses Go 1.22+ ServeMux method+
// wildcard patterns rather than a router dependency.
package feed

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

const defaultRoomID = "general"

type Handlers struct {
	DB *bun.DB
}

func Register(mux *http.ServeMux, database *bun.DB) {
	h := &Handlers{DB: database}
	mux.HandleFunc("GET /api/rooms", h.listRooms)
	mux.HandleFunc("POST /api/rooms", h.createRoom)
	mux.HandleFunc("GET /api/posts", h.listPosts)
	mux.HandleFunc("POST /api/posts", h.createPost)
	mux.HandleFunc("GET /api/posts/{id}", h.getPost)
	mux.HandleFunc("GET /api/posts/{id}/comments", h.listComments)
	mux.HandleFunc("POST /api/posts/{id}/comments", h.createComment)
	mux.HandleFunc("POST /api/posts/{id}/like", h.likePost)
	mux.HandleFunc("DELETE /api/posts/{id}/like", h.unlikePost)
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

// writeInternalError logs the real error server-side (nothing else in this
// file did, which cost real debugging time chasing a pgdriver
// incompatibility earlier — see postSelect's comment) before sending the
// client a generic message.
func writeInternalError(w http.ResponseWriter, err error) {
	log.Printf("internal error: %v", err)
	writeError(w, http.StatusInternalServerError, "internal error")
}

type roomOut struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// authorVerified is read live from the shared user.email_verified column —
// there's no real identity-verification (KYC/face-scan) system yet, see
// coarea_product_rules memory. Honest interim proxy, not the real feature.
type postOut struct {
	ID             string    `json:"id"`
	RoomID         string    `json:"roomId"`
	Author         string    `json:"author"`
	AuthorVerified bool      `json:"authorVerified"`
	Category       string    `json:"category"`
	Body           string    `json:"body"`
	CreatedAt      time.Time `json:"createdAt"`
	LikeCount      int       `json:"likeCount"`
	ReplyCount     int       `json:"replyCount"`
}

type commentOut struct {
	ID             string    `json:"id"`
	Author         string    `json:"author"`
	AuthorVerified bool      `json:"authorVerified"`
	Body           string    `json:"body"`
	CreatedAt      time.Time `json:"createdAt"`
}

// pgdriver only binds parameters correctly when queries go through bun's
// own formatter (NewRaw(...).Scan(...) with "?" placeholders) — calling
// the embedded *sql.DB's QueryContext/QueryRowContext directly with a
// literal "$1" sends the query via the simple protocol, where Postgres
// rejects "$1" with "there is no parameter $1" (SQLSTATE 42P02).
const postSelect = `
	SELECT p.id AS id, p.room_id AS room_id, u.name AS author, u.email_verified AS author_verified,
		p.category AS category, p.body AS body, p.created_at AS created_at,
		(SELECT count(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
		(SELECT count(*) FROM comments c WHERE c.post_id = p.id) AS reply_count
	FROM posts p
	JOIN "user" u ON u.id = p.author_id
`

// postRow's bun tags match postSelect's column aliases — NewRaw(...).Scan
// maps columns onto these tags the same way Model() does for real tables.
type postRow struct {
	ID             string    `bun:"id"`
	RoomID         string    `bun:"room_id"`
	Author         string    `bun:"author"`
	AuthorVerified bool      `bun:"author_verified"`
	Category       string    `bun:"category"`
	Body           string    `bun:"body"`
	CreatedAt      time.Time `bun:"created_at"`
	LikeCount      int       `bun:"like_count"`
	ReplyCount     int       `bun:"reply_count"`
}

func (row postRow) toOut() postOut {
	return postOut{
		ID: row.ID, RoomID: row.RoomID, Author: row.Author, AuthorVerified: row.AuthorVerified,
		Category: row.Category, Body: row.Body, CreatedAt: row.CreatedAt,
		LikeCount: row.LikeCount, ReplyCount: row.ReplyCount,
	}
}

func (h *Handlers) listPosts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	query := postSelect
	args := []any{}
	if roomID := r.URL.Query().Get("room_id"); roomID != "" {
		query += ` WHERE p.room_id = ?`
		args = append(args, roomID)
	}
	query += ` ORDER BY p.created_at DESC`

	var rows []postRow
	if err := h.DB.NewRaw(query, args...).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}

	posts := make([]postOut, len(rows))
	for i, row := range rows {
		posts[i] = row.toOut()
	}
	writeJSON(w, http.StatusOK, map[string]any{"posts": posts})
}

func (h *Handlers) getPostByID(ctx context.Context, id string) (postOut, error) {
	var row postRow
	if err := h.DB.NewRaw(postSelect+` WHERE p.id = ?`, id).Scan(ctx, &row); err != nil {
		return postOut{}, err
	}
	return row.toOut(), nil
}

func (h *Handlers) getPost(w http.ResponseWriter, r *http.Request) {
	p, err := h.getPostByID(r.Context(), r.PathValue("id"))
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "Post not found")
		return
	}
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"post": p})
}

func (h *Handlers) createPost(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var body struct {
		RoomID   string `json:"roomId"`
		Category string `json:"category"`
		Body     string `json:"body"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Category == "" || body.Body == "" {
		writeError(w, http.StatusUnprocessableEntity, "category and body are required")
		return
	}

	roomID := body.RoomID
	if roomID == "" {
		roomID = defaultRoomID
		if _, err := h.DB.NewInsert().
			Model(&dbpkg.Room{ID: defaultRoomID, Name: "General", CreatedBy: user.ID}).
			On("CONFLICT (id) DO NOTHING").
			Exec(ctx); err != nil {
			writeInternalError(w, err)
			return
		}
	}

	post := &dbpkg.Post{ID: newID("post"), RoomID: roomID, AuthorID: user.ID, Category: body.Category, Body: body.Body}
	if _, err := h.DB.NewInsert().Model(post).Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	created, err := h.getPostByID(ctx, post.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"post": created})
}

func (h *Handlers) listRooms(w http.ResponseWriter, r *http.Request) {
	var rooms []dbpkg.Room
	if err := h.DB.NewSelect().Model(&rooms).Order("created_at ASC").Scan(r.Context()); err != nil {
		writeInternalError(w, err)
		return
	}
	out := make([]roomOut, len(rooms))
	for i, room := range rooms {
		out[i] = roomOut{ID: room.ID, Name: room.Name}
	}
	writeJSON(w, http.StatusOK, map[string]any{"rooms": out})
}

func (h *Handlers) createRoom(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var body struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		writeError(w, http.StatusUnprocessableEntity, "name is required")
		return
	}

	room := &dbpkg.Room{ID: newID("room"), Name: body.Name, CreatedBy: user.ID}
	if _, err := h.DB.NewInsert().Model(room).Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"room": roomOut{ID: room.ID, Name: room.Name}})
}

const commentSelect = `
	SELECT c.id AS id, u.name AS author, u.email_verified AS author_verified, c.body AS body, c.created_at AS created_at
	FROM comments c
	JOIN "user" u ON u.id = c.author_id
	WHERE c.post_id = ?
	ORDER BY c.created_at ASC
`

type commentRow struct {
	ID             string    `bun:"id"`
	Author         string    `bun:"author"`
	AuthorVerified bool      `bun:"author_verified"`
	Body           string    `bun:"body"`
	CreatedAt      time.Time `bun:"created_at"`
}

func (row commentRow) toOut() commentOut {
	return commentOut{ID: row.ID, Author: row.Author, AuthorVerified: row.AuthorVerified, Body: row.Body, CreatedAt: row.CreatedAt}
}

func (h *Handlers) postExists(ctx context.Context, id string) (bool, error) {
	_, err := h.getPostByID(ctx, id)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (h *Handlers) listComments(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
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

	var rows []commentRow
	if err := h.DB.NewRaw(commentSelect, postID).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}

	comments := make([]commentOut, len(rows))
	for i, row := range rows {
		comments[i] = row.toOut()
	}
	writeJSON(w, http.StatusOK, map[string]any{"comments": comments})
}

func (h *Handlers) createComment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
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
		Body string `json:"body"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Body == "" {
		writeError(w, http.StatusUnprocessableEntity, "body is required")
		return
	}

	comment := &dbpkg.Comment{ID: newID("comment"), PostID: postID, AuthorID: user.ID, Body: body.Body}
	if _, err := h.DB.NewInsert().Model(comment).Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"comment": commentOut{ID: comment.ID, Author: user.Name, AuthorVerified: user.Verified, Body: comment.Body, CreatedAt: time.Now()},
	})
}

func (h *Handlers) likePost(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
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

	if _, err := h.DB.NewInsert().
		Model(&dbpkg.Like{PostID: postID, UserID: user.ID}).
		On("CONFLICT (post_id, user_id) DO NOTHING").
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"liked": true})
}

func (h *Handlers) unlikePost(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	postID := r.PathValue("id")
	if _, err := h.DB.NewDelete().
		Model((*dbpkg.Like)(nil)).
		Where("post_id = ? AND user_id = ?", postID, user.ID).
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"liked": false})
}
