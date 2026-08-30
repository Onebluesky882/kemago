// Package stories implements IG-style ephemeral (24h) photo/video posts,
// uploaded via presigned R2 URLs (internal/storage) — the client uploads
// straight to R2, this service never sees the file bytes. See
// DECISIONS.md → "Backend Domain Ownership — TypeScript Is Auth-Only" and
// internal/feed/feed.go for the conventions this package follows.
package stories

import (
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
	"github.com/onebluesky882/kemago/backend/api-go/internal/storage"
)

type Handlers struct {
	DB      *bun.DB
	Storage *storage.Client
}

func Register(mux *http.ServeMux, database *bun.DB, storageClient *storage.Client) {
	h := &Handlers{DB: database, Storage: storageClient}
	mux.HandleFunc("POST /api/stories/upload-url", h.getUploadURL)
	mux.HandleFunc("POST /api/stories", h.createStory)
	mux.HandleFunc("GET /api/stories", h.listStories)
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

func newID(prefix string) string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return prefix + "_" + hex.EncodeToString(b)
}

// getUploadURL: step 1 of 2. Client asks for a place to upload; we hand
// back a presigned PUT URL (valid 15 minutes) plus the objectKey they'll
// need to reference in step 2 (createStory) once the upload succeeds.
// Nothing is written to the database here — an abandoned upload (client
// gets the URL, never actually PUTs or never calls createStory) just
// leaves an orphaned, harmless object in R2, not a half-created story row.
func (h *Handlers) getUploadURL(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var body struct {
		MediaType   string `json:"mediaType"`   // "image" | "video"
		ContentType string `json:"contentType"` // e.g. "image/jpeg", "video/mp4" — must match the actual upload's Content-Type header exactly, the signature covers it
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil ||
		(body.MediaType != "image" && body.MediaType != "video") || body.ContentType == "" {
		writeError(w, http.StatusUnprocessableEntity, "mediaType (image|video) and contentType are required")
		return
	}

	ext := extForContentType(body.ContentType)
	objectKey := user.ID + "/" + newID("story") + ext

	uploadURL, err := h.Storage.PresignUpload(ctx, objectKey, body.ContentType)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"uploadUrl": uploadURL, "objectKey": objectKey})
}

func extForContentType(contentType string) string {
	switch contentType {
	case "image/jpeg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/webp":
		return ".webp"
	case "video/mp4":
		return ".mp4"
	case "video/quicktime":
		return ".mov"
	default:
		return ""
	}
}

// createStory: step 2 of 2, called once the client's direct PUT to R2
// (using objectKey from getUploadURL) has succeeded. This service never
// verifies the object actually exists in R2 before registering it — a
// client that lies about a successful upload just gets a story row
// pointing at a 404, no worse than any other client-trusted metadata here.
func (h *Handlers) createStory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var body struct {
		ObjectKey string `json:"objectKey"`
		MediaType string `json:"mediaType"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil ||
		body.ObjectKey == "" || (body.MediaType != "image" && body.MediaType != "video") {
		writeError(w, http.StatusUnprocessableEntity, "objectKey and mediaType (image|video) are required")
		return
	}

	now := time.Now()
	story := &dbpkg.Story{
		ID:        newID("story_post"),
		AuthorID:  user.ID,
		MediaKey:  body.ObjectKey,
		MediaType: body.MediaType,
		CreatedAt: now,
		ExpiresAt: now.Add(24 * time.Hour),
	}
	if _, err := h.DB.NewInsert().Model(story).Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	mediaURL, err := h.Storage.PublicURL(ctx, story.MediaKey)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"story": storyOut{
		ID: story.ID, AuthorID: story.AuthorID, Author: user.Name, AuthorVerified: user.Verified,
		MediaURL: mediaURL, MediaType: story.MediaType, CreatedAt: story.CreatedAt, ExpiresAt: story.ExpiresAt,
	}})
}

type storyOut struct {
	ID             string    `json:"id"`
	AuthorID       string    `json:"authorId"`
	Author         string    `json:"author"`
	AuthorVerified bool      `json:"authorVerified"`
	MediaURL       string    `json:"mediaUrl"`
	MediaType      string    `json:"mediaType"`
	CreatedAt      time.Time `json:"createdAt"`
	ExpiresAt      time.Time `json:"expiresAt"`
}

const activeStoriesSelect = `
	SELECT s.id AS id, s.author_id AS author_id, u.name AS author, u.email_verified AS author_verified,
		s.media_key AS media_key, s.media_type AS media_type, s.created_at AS created_at, s.expires_at AS expires_at
	FROM stories s
	JOIN "user" u ON u.id = s.author_id
	WHERE s.expires_at > now()
	ORDER BY s.created_at DESC
`

type storyRow struct {
	ID             string    `bun:"id"`
	AuthorID       string    `bun:"author_id"`
	Author         string    `bun:"author"`
	AuthorVerified bool      `bun:"author_verified"`
	MediaKey       string    `bun:"media_key"`
	MediaType      string    `bun:"media_type"`
	CreatedAt      time.Time `bun:"created_at"`
	ExpiresAt      time.Time `bun:"expires_at"`
}

// listStories: no auth required to view, same as GET /api/posts — but
// every row still needs a live-signed media URL when the bucket has no
// public base configured (see storage.Client.PublicURL), so this is not a
// cheap "just SELECT and dump" endpoint if R2_PUBLIC_URL is unset.
func (h *Handlers) listStories(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var rows []storyRow
	if err := h.DB.NewRaw(activeStoriesSelect).Scan(ctx, &rows); err != nil {
		if err == sql.ErrNoRows {
			writeJSON(w, http.StatusOK, map[string]any{"stories": []storyOut{}})
			return
		}
		writeInternalError(w, err)
		return
	}

	out := make([]storyOut, len(rows))
	for i, row := range rows {
		mediaURL, err := h.Storage.PublicURL(ctx, row.MediaKey)
		if err != nil {
			writeInternalError(w, err)
			return
		}
		out[i] = storyOut{
			ID: row.ID, AuthorID: row.AuthorID, Author: row.Author, AuthorVerified: row.AuthorVerified,
			MediaURL: mediaURL, MediaType: row.MediaType, CreatedAt: row.CreatedAt, ExpiresAt: row.ExpiresAt,
		}
	}
	writeJSON(w, http.StatusOK, map[string]any{"stories": out})
}
