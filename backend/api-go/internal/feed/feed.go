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

	"github.com/redis/go-redis/v9"
	"github.com/uptrace/bun"

	"github.com/onebluesky882/kemago/backend/api-go/internal/authcheck"
	"github.com/onebluesky882/kemago/backend/api-go/internal/blocks"
	dbpkg "github.com/onebluesky882/kemago/backend/api-go/internal/db"
	"github.com/onebluesky882/kemago/backend/api-go/internal/hub"
	"github.com/onebluesky882/kemago/backend/api-go/internal/notifications"
	"github.com/onebluesky882/kemago/backend/api-go/internal/ratelimit"
)

const defaultRoomID = "general"

// feedChannel is the single websocket channel every connected client
// receives Feed real-time events on — the Feed UI shows every room's
// posts mixed together (no per-room view yet), so events aren't scoped
// per-room either. See internal/hub.
const feedChannel = "feed:all"

type Handlers struct {
	DB  *bun.DB
	Hub *hub.Hub
	RDB *redis.Client
}

func Register(mux *http.ServeMux, database *bun.DB, wsHub *hub.Hub, rdb *redis.Client) {
	h := &Handlers{DB: database, Hub: wsHub, RDB: rdb}
	mux.HandleFunc("GET /api/rooms", h.listRooms)
	mux.HandleFunc("POST /api/rooms", h.createRoom)
	mux.HandleFunc("POST /api/rooms/{id}/join", h.joinRoom)
	mux.HandleFunc("POST /api/rooms/{id}/leave", h.leaveRoom)
	mux.HandleFunc("GET /api/rooms/{id}/members", h.listRoomMembers)
	mux.HandleFunc("GET /api/posts", h.listPosts)
	mux.HandleFunc("POST /api/posts", h.createPost)
	mux.HandleFunc("GET /api/posts/{id}", h.getPost)
	mux.HandleFunc("GET /api/posts/{id}/comments", h.listComments)
	mux.HandleFunc("POST /api/posts/{id}/comments", h.createComment)
	mux.HandleFunc("POST /api/posts/{id}/like", h.likePost)
	mux.HandleFunc("DELETE /api/posts/{id}/like", h.unlikePost)
}

// rateLimited checks (and reports 429 on) a per-user, per-action limit.
// Returns true if the caller has already written a response and the
// handler should return immediately.
func (h *Handlers) rateLimited(w http.ResponseWriter, ctx context.Context, action, userID string, limit int, window time.Duration) bool {
	key := "ratelimit:" + action + ":" + userID
	if !ratelimit.Allow(ctx, h.RDB, key, limit, window) {
		writeError(w, http.StatusTooManyRequests, "Too many requests, slow down")
		return true
	}
	return false
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

// broadcast pushes a real-time event to every client connected to the
// shared feed channel — best-effort: a marshal failure just logs, it
// never fails the HTTP request that triggered it.
func (h *Handlers) broadcast(ctx context.Context, event map[string]any) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("broadcast marshal: %v", err)
		return
	}
	h.Hub.Broadcast(ctx, feedChannel, data)
}

type roomOut struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	MemberCount int    `json:"memberCount"`
	Joined      bool   `json:"joined"`
}

// authorVerified is read live from the shared user.email_verified column —
// there's no real identity-verification (KYC/face-scan) system yet, see
// coarea_product_rules memory. Honest interim proxy, not the real feature.
type postOut struct {
	ID             string    `json:"id"`
	RoomID         string    `json:"roomId"`
	AuthorID       string    `json:"authorId"`
	Author         string    `json:"author"`
	AuthorVerified bool      `json:"authorVerified"`
	Category       string    `json:"category"`
	Body           string    `json:"body"`
	CreatedAt      time.Time `json:"createdAt"`
	LikeCount      int       `json:"likeCount"`
	ReplyCount     int       `json:"replyCount"`
	HasPoll        bool      `json:"hasPoll"`
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
// hasPoll checks the polls table directly (a different package's domain,
// but the same physical Postgres database and Go binary — see
// DECISIONS.md) rather than importing internal/polls, which would create
// an import cycle (polls already needs feed's postExists-style check).
const postSelect = `
	SELECT p.id AS id, p.room_id AS room_id, p.author_id AS author_id, u.name AS author, u.email_verified AS author_verified,
		p.category AS category, p.body AS body, p.created_at AS created_at,
		(SELECT count(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
		(SELECT count(*) FROM comments c WHERE c.post_id = p.id) AS reply_count,
		EXISTS(SELECT 1 FROM polls pl WHERE pl.post_id = p.id) AS has_poll
	FROM posts p
	JOIN "user" u ON u.id = p.author_id
`

// postRow's bun tags match postSelect's column aliases — NewRaw(...).Scan
// maps columns onto these tags the same way Model() does for real tables.
type postRow struct {
	ID             string    `bun:"id"`
	RoomID         string    `bun:"room_id"`
	AuthorID       string    `bun:"author_id"`
	Author         string    `bun:"author"`
	AuthorVerified bool      `bun:"author_verified"`
	Category       string    `bun:"category"`
	Body           string    `bun:"body"`
	CreatedAt      time.Time `bun:"created_at"`
	LikeCount      int       `bun:"like_count"`
	ReplyCount     int       `bun:"reply_count"`
	HasPoll        bool      `bun:"has_poll"`
}

func (row postRow) toOut() postOut {
	return postOut{
		ID: row.ID, RoomID: row.RoomID, AuthorID: row.AuthorID, Author: row.Author, AuthorVerified: row.AuthorVerified,
		Category: row.Category, Body: row.Body, CreatedAt: row.CreatedAt,
		LikeCount: row.LikeCount, ReplyCount: row.ReplyCount, HasPoll: row.HasPoll,
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

	// Best-effort: an anonymous (no/invalid Bearer token) caller sees
	// everything — blocking is a signed-in-user feature, not a login wall.
	var blockedIDs map[string]bool
	if user, ok := authcheck.RequireUser(ctx, h.DB, r); ok {
		ids, err := blocks.BlockedIDs(ctx, h.DB, user.ID)
		if err != nil {
			writeInternalError(w, err)
			return
		}
		blockedIDs = make(map[string]bool, len(ids))
		for _, id := range ids {
			blockedIDs[id] = true
		}
	}

	posts := make([]postOut, 0, len(rows))
	for _, row := range rows {
		if blockedIDs[row.AuthorID] {
			continue
		}
		posts = append(posts, row.toOut())
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
	if h.rateLimited(w, ctx, "post", user.ID, 10, time.Minute) {
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
	h.broadcast(ctx, map[string]any{"type": "post_created", "post": created})
	writeJSON(w, http.StatusCreated, map[string]any{"post": created})
}

const roomSelect = `
	SELECT r.id AS id, r.name AS name,
		(SELECT count(*) FROM room_members m WHERE m.room_id = r.id) AS member_count,
		EXISTS(SELECT 1 FROM room_members m WHERE m.room_id = r.id AND m.user_id = ?) AS joined
	FROM rooms r
	ORDER BY r.created_at ASC
`

type roomRow struct {
	ID          string `bun:"id"`
	Name        string `bun:"name"`
	MemberCount int    `bun:"member_count"`
	Joined      bool   `bun:"joined"`
}

func (h *Handlers) listRooms(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	// Best-effort: an anonymous caller just always sees joined=false.
	user, _ := authcheck.RequireUser(ctx, h.DB, r)

	var rows []roomRow
	if err := h.DB.NewRaw(roomSelect, user.ID).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}
	out := make([]roomOut, len(rows))
	for i, row := range rows {
		out[i] = roomOut{ID: row.ID, Name: row.Name, MemberCount: row.MemberCount, Joined: row.Joined}
	}
	writeJSON(w, http.StatusOK, map[string]any{"rooms": out})
}

func (h *Handlers) joinRoom(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	roomID := r.PathValue("id")
	if _, err := h.DB.NewInsert().
		Model(&dbpkg.RoomMember{RoomID: roomID, UserID: user.ID}).
		On("CONFLICT (room_id, user_id) DO NOTHING").
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"joined": true})
}

func (h *Handlers) leaveRoom(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	roomID := r.PathValue("id")
	if _, err := h.DB.NewDelete().
		Model((*dbpkg.RoomMember)(nil)).
		Where("room_id = ? AND user_id = ?", roomID, user.ID).
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"joined": false})
}

const roomMemberSelect = `
	SELECT u.id AS id, u.name AS name, u.email_verified AS verified, m.joined_at AS joined_at
	FROM room_members m
	JOIN "user" u ON u.id = m.user_id
	WHERE m.room_id = ?
	ORDER BY m.joined_at ASC
`

type roomMemberRow struct {
	ID       string    `bun:"id"`
	Name     string    `bun:"name"`
	Verified bool      `bun:"verified"`
	JoinedAt time.Time `bun:"joined_at"`
}

type roomMemberOut struct {
	ID       string    `json:"id"`
	Name     string    `json:"name"`
	Verified bool      `json:"verified"`
	JoinedAt time.Time `json:"joinedAt"`
}

func (h *Handlers) listRoomMembers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	roomID := r.PathValue("id")

	var rows []roomMemberRow
	if err := h.DB.NewRaw(roomMemberSelect, roomID).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}
	out := make([]roomMemberOut, len(rows))
	for i, row := range rows {
		out[i] = roomMemberOut{ID: row.ID, Name: row.Name, Verified: row.Verified, JoinedAt: row.JoinedAt}
	}
	writeJSON(w, http.StatusOK, map[string]any{"members": out})
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
	if _, err := h.DB.NewInsert().
		Model(&dbpkg.RoomMember{RoomID: room.ID, UserID: user.ID}).
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"room": roomOut{ID: room.ID, Name: room.Name, MemberCount: 1, Joined: true}})
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
	if h.rateLimited(w, ctx, "comment", user.ID, 20, time.Minute) {
		return
	}

	postID := r.PathValue("id")
	post, err := h.getPostByID(ctx, postID)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "Post not found")
		return
	}
	if err != nil {
		writeInternalError(w, err)
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

	created := commentOut{ID: comment.ID, Author: user.Name, AuthorVerified: user.Verified, Body: comment.Body, CreatedAt: time.Now()}
	h.broadcast(ctx, map[string]any{"type": "comment_created", "postId": postID, "comment": created})
	notifications.Push(ctx, h.DB, post.AuthorID, "comment", user.ID, user.Name, &postID)
	writeJSON(w, http.StatusCreated, map[string]any{"comment": created})
}

// isNewLike reports whether an insert with ON CONFLICT DO NOTHING actually
// inserted a row. A double-tap/retry on an already-liked post affects zero
// rows, and shouldn't spam the author with a duplicate notification.
func isNewLike(res sql.Result) bool {
	n, _ := res.RowsAffected()
	return n > 0
}

func (h *Handlers) likePost(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if h.rateLimited(w, ctx, "like", user.ID, 30, time.Minute) {
		return
	}

	postID := r.PathValue("id")
	post, err := h.getPostByID(ctx, postID)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "Post not found")
		return
	}
	if err != nil {
		writeInternalError(w, err)
		return
	}

	res, err := h.DB.NewInsert().
		Model(&dbpkg.Like{PostID: postID, UserID: user.ID}).
		On("CONFLICT (post_id, user_id) DO NOTHING").
		Exec(ctx)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	h.broadcastLikeChanged(ctx, postID)
	if isNewLike(res) {
		notifications.Push(ctx, h.DB, post.AuthorID, "like", user.ID, user.Name, &postID)
	}
	writeJSON(w, http.StatusOK, map[string]bool{"liked": true})
}

// broadcastLikeChanged re-reads the post's current like count and pushes
// it — best-effort, same reasoning as broadcast above (a lookup failure
// here shouldn't fail the like/unlike request that triggered it).
func (h *Handlers) broadcastLikeChanged(ctx context.Context, postID string) {
	post, err := h.getPostByID(ctx, postID)
	if err != nil {
		log.Printf("broadcastLikeChanged: %v", err)
		return
	}
	h.broadcast(ctx, map[string]any{"type": "like_changed", "postId": postID, "likeCount": post.LikeCount})
}

func (h *Handlers) unlikePost(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if h.rateLimited(w, ctx, "like", user.ID, 30, time.Minute) {
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
	h.broadcastLikeChanged(ctx, postID)
	writeJSON(w, http.StatusOK, map[string]bool{"liked": false})
}
