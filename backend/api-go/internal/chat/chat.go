// Package chat implements 1:1 DMs and group chats under one schema — a DM
// is just a conversation with exactly 2 members (dm_key set, uniquely
// indexed to prevent duplicates), a group is a conversation with any
// number of members and an owner (dm_key null). Mirrors internal/clubs
// and internal/feed's conventions (Go 1.22+ ServeMux method+wildcard
// patterns, bun for queries via NewRaw(...).Scan(...) with "?"
// placeholders — see feed.go's postSelect comment for why raw "$1"-style
// placeholders fail against this project's pgdriver setup, its own copy
// of the writeJSON/writeError/writeInternalError helpers, newID(prefix)
// for ids). See DECISIONS.md → "Backend Domain Ownership — TypeScript Is
// Auth-Only".
package chat

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/coder/websocket"
	"github.com/uptrace/bun"

	"github.com/onebluesky882/kemago/backend/api-go/internal/authcheck"
	dbpkg "github.com/onebluesky882/kemago/backend/api-go/internal/db"
	"github.com/onebluesky882/kemago/backend/api-go/internal/hub"
	"github.com/onebluesky882/kemago/backend/api-go/internal/storage"
)

// chatChannel returns the hub room a conversation's realtime events are
// broadcast on — each conversation gets its own room (unlike feed's single
// global "feed:all"), since a chat client only cares about the
// conversations it's actually open to.
func chatChannel(conversationID string) string {
	return "chat:" + conversationID
}

type Handlers struct {
	DB      *bun.DB
	Hub     *hub.Hub
	Storage *storage.Client // may be nil — image upload is optional, same reasoning as internal/stories
}

func Register(mux *http.ServeMux, database *bun.DB, wsHub *hub.Hub, storageClient *storage.Client) {
	h := &Handlers{DB: database, Hub: wsHub, Storage: storageClient}
	mux.HandleFunc("GET /api/conversations", h.listConversations)
	mux.HandleFunc("POST /api/conversations", h.createConversation)
	mux.HandleFunc("GET /api/conversations/{id}/messages", h.listMessages)
	mux.HandleFunc("POST /api/conversations/{id}/messages", h.createMessage)
	mux.HandleFunc("GET /api/conversations/{id}/members", h.listMembers)
	mux.HandleFunc("POST /api/conversations/{id}/invite", h.inviteMember)
	mux.HandleFunc("POST /api/conversations/{id}/leave", h.leaveConversation)
	mux.HandleFunc("POST /api/conversations/{id}/upload-url", h.getUploadURL)
	mux.HandleFunc("POST /api/conversations/{id}/read", h.markRead)
	mux.HandleFunc("GET /ws/chat/{id}", h.joinChatSocket)
}

// joinChatSocket authenticates the caller and verifies they're actually a
// member of this conversation before letting them listen on its hub room —
// unlike main.go's generic /ws?room=<room>, which trusts any client-supplied
// room string with no membership check, this is the auth chat.Register
// promised (see main.go's /ws comment). Real-time delivery of
// message_created events (see createMessage's h.broadcast call) — the
// client still uses GET .../messages for the initial/paginated history.
func (h *Handlers) joinChatSocket(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "missing ?token=", http.StatusBadRequest)
		return
	}
	user, ok := authcheck.UserForToken(ctx, h.DB, token)
	if !ok {
		http.Error(w, "invalid token", http.StatusUnauthorized)
		return
	}

	conversationID := r.PathValue("id")
	member, err := h.isMember(ctx, conversationID, user.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if !member {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	conn, err := websocket.Accept(w, r, nil)
	if err != nil {
		log.Printf("chat ws: accept failed: %v", err)
		return
	}
	defer conn.CloseNow()

	h.Hub.Join(ctx, conn, chatChannel(conversationID))
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

func writeInternalError(w http.ResponseWriter, err error) {
	log.Printf("internal error: %v", err)
	writeError(w, http.StatusInternalServerError, "internal error")
}

func (h *Handlers) broadcast(ctx context.Context, conversationID string, event map[string]any) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("chat broadcast marshal: %v", err)
		return
	}
	h.Hub.Broadcast(ctx, chatChannel(conversationID), data)
}

// dmKey sorts the two participant ids so the pair is order-independent —
// creating a DM as (A, B) or (B, A) must land on the same key, that's the
// whole point of the partial unique index on conversations.dm_key.
func dmKey(a, b string) string {
	ids := []string{a, b}
	sort.Strings(ids)
	return ids[0] + "|" + ids[1]
}

type otherUserOut struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type conversationOut struct {
	ID            string        `json:"id"`
	Type          string        `json:"type"`
	Name          string        `json:"name"`
	MemberCount   int           `json:"memberCount"`
	LastMessage   *string       `json:"lastMessage"`
	LastMessageAt *time.Time    `json:"lastMessageAt"`
	OtherUser     *otherUserOut `json:"otherUser"`
	CreatedAt     time.Time     `json:"createdAt"`
}

// conversationSelect's first two placeholders are always the requesting
// user's id (once for the membership INNER JOIN — a caller only ever sees
// conversations they belong to — and once to exclude themselves from the
// "other participant" lookup on DMs). Append " WHERE c.id = ?" or
// " ORDER BY ..." per call site, same pattern as internal/clubs'
// clubSelect.
const conversationSelect = `
	SELECT c.id AS id, c.type AS type, c.name AS name, c.created_at AS created_at,
		(SELECT count(*) FROM conversation_members cm WHERE cm.conversation_id = c.id) AS member_count,
		lm.content AS last_message, lm.created_at AS last_message_at,
		ou.id AS other_user_id, ou.name AS other_user_name
	FROM conversations c
	JOIN conversation_members me ON me.conversation_id = c.id AND me.user_id = ?
	LEFT JOIN LATERAL (
		SELECT CASE WHEN m.content <> '' THEN m.content WHEN m.image_key IS NOT NULL THEN 'Photo' ELSE '' END AS content,
			m.created_at AS created_at
		FROM messages m
		WHERE m.conversation_id = c.id
		ORDER BY m.created_at DESC
		LIMIT 1
	) lm ON true
	LEFT JOIN LATERAL (
		SELECT u.id AS id, u.name AS name
		FROM conversation_members cm2
		JOIN "user" u ON u.id = cm2.user_id
		WHERE cm2.conversation_id = c.id AND cm2.user_id != ? AND c.type = 'dm'
		LIMIT 1
	) ou ON true
`

type conversationRow struct {
	ID            string     `bun:"id"`
	Type          string     `bun:"type"`
	Name          string     `bun:"name"`
	CreatedAt     time.Time  `bun:"created_at"`
	MemberCount   int        `bun:"member_count"`
	LastMessage   *string    `bun:"last_message"`
	LastMessageAt *time.Time `bun:"last_message_at"`
	OtherUserID   *string    `bun:"other_user_id"`
	OtherUserName *string    `bun:"other_user_name"`
}

func (row conversationRow) toOut() conversationOut {
	out := conversationOut{
		ID: row.ID, Type: row.Type, Name: row.Name, CreatedAt: row.CreatedAt,
		MemberCount: row.MemberCount,
	}
	// An empty last_message (no messages yet) should read as "no preview",
	// not an empty-string preview.
	if row.LastMessage != nil && *row.LastMessage != "" {
		out.LastMessage = row.LastMessage
		out.LastMessageAt = row.LastMessageAt
	}
	if row.OtherUserID != nil {
		out.OtherUser = &otherUserOut{ID: *row.OtherUserID, Name: *row.OtherUserName}
	}
	return out
}

func (h *Handlers) getConversationByID(ctx context.Context, id, requesterID string) (conversationOut, error) {
	var row conversationRow
	if err := h.DB.NewRaw(conversationSelect+` WHERE c.id = ?`, requesterID, requesterID, id).Scan(ctx, &row); err != nil {
		return conversationOut{}, err
	}
	return row.toOut(), nil
}

func (h *Handlers) isMember(ctx context.Context, conversationID, userID string) (bool, error) {
	return h.DB.NewSelect().
		Model((*dbpkg.ConversationMember)(nil)).
		Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Exists(ctx)
}

func (h *Handlers) memberRole(ctx context.Context, conversationID, userID string) (string, error) {
	var m dbpkg.ConversationMember
	err := h.DB.NewSelect().Model(&m).
		Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Scan(ctx)
	return m.Role, err
}

func (h *Handlers) listConversations(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var rows []conversationRow
	query := conversationSelect + ` ORDER BY COALESCE(lm.created_at, c.created_at) DESC`
	if err := h.DB.NewRaw(query, user.ID, user.ID).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}
	out := make([]conversationOut, len(rows))
	for i, row := range rows {
		out[i] = row.toOut()
	}
	writeJSON(w, http.StatusOK, map[string]any{"conversations": out})
}

func (h *Handlers) createConversation(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var body struct {
		Type      string   `json:"type"` // "dm" | "group"
		UserID    string   `json:"userId"`
		Name      string   `json:"name"`
		MemberIDs []string `json:"memberIds"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusUnprocessableEntity, "invalid body")
		return
	}

	switch body.Type {
	case "dm":
		h.createDM(w, r, user, body.UserID)
	case "group":
		h.createGroup(w, r, user, body.Name, body.MemberIDs)
	default:
		writeError(w, http.StatusUnprocessableEntity, `type must be "dm" or "group"`)
	}
}

// createDM re-reads state before assuming a new row is needed — the same
// idempotency lesson as internal/clubs' joinClub/leaveClub fix: a client
// retrying (or two clients opening a DM with each other at once) must land
// on the SAME conversation, not a duplicate. There's a small race window
// between the existence check and the insert (no transaction/advisory
// lock) — acceptable at this app's traffic level, same pragmatism as
// clubs.go not wrapping its own multi-statement writes in a transaction;
// a genuine race just surfaces as a write-conflict error on the loser,
// who can retry and will then find the winner's row via the dm_key lookup.
func (h *Handlers) createDM(w http.ResponseWriter, r *http.Request, user authcheck.User, otherUserID string) {
	ctx := r.Context()
	if otherUserID == "" || otherUserID == user.ID {
		writeError(w, http.StatusUnprocessableEntity, "userId is required and must not be the caller")
		return
	}

	key := dmKey(user.ID, otherUserID)
	var existing dbpkg.Conversation
	err := h.DB.NewSelect().Model(&existing).Where("dm_key = ?", key).Scan(ctx)
	if err == nil {
		out, err := h.getConversationByID(ctx, existing.ID, user.ID)
		if err != nil {
			writeInternalError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"conversation": out})
		return
	}
	if err != sql.ErrNoRows {
		writeInternalError(w, err)
		return
	}

	convo := &dbpkg.Conversation{ID: newID("conv"), Type: "dm", Name: "", DMKey: &key, CreatedBy: user.ID}
	if _, err := h.DB.NewInsert().Model(convo).Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	members := []dbpkg.ConversationMember{
		{ConversationID: convo.ID, UserID: user.ID, Role: "member"},
		{ConversationID: convo.ID, UserID: otherUserID, Role: "member"},
	}
	if _, err := h.DB.NewInsert().Model(&members).Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	out, err := h.getConversationByID(ctx, convo.ID, user.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"conversation": out})
}

func (h *Handlers) createGroup(w http.ResponseWriter, r *http.Request, user authcheck.User, name string, memberIDs []string) {
	ctx := r.Context()
	if strings.TrimSpace(name) == "" {
		writeError(w, http.StatusUnprocessableEntity, "name is required")
		return
	}

	convo := &dbpkg.Conversation{ID: newID("conv"), Type: "group", Name: name, DMKey: nil, CreatedBy: user.ID}
	if _, err := h.DB.NewInsert().Model(convo).Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	members := []dbpkg.ConversationMember{{ConversationID: convo.ID, UserID: user.ID, Role: "owner"}}
	seen := map[string]bool{user.ID: true}
	for _, id := range memberIDs {
		if id == "" || seen[id] {
			continue
		}
		seen[id] = true
		members = append(members, dbpkg.ConversationMember{ConversationID: convo.ID, UserID: id, Role: "member"})
	}
	if _, err := h.DB.NewInsert().Model(&members).
		On("CONFLICT (conversation_id, user_id) DO NOTHING").
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	out, err := h.getConversationByID(ctx, convo.ID, user.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"conversation": out})
}

type messageOut struct {
	ID             string    `json:"id"`
	ConversationID string    `json:"conversationId"`
	SenderID       string    `json:"senderId"`
	SenderName     string    `json:"senderName"`
	Content        string    `json:"content"`
	ImageURL       *string   `json:"imageUrl"`
	CreatedAt      time.Time `json:"createdAt"`
}

const messageSelect = `
	SELECT m.id AS id, m.conversation_id AS conversation_id, m.sender_id AS sender_id, u.name AS sender_name,
		m.content AS content, m.image_key AS image_key, m.created_at AS created_at
	FROM messages m
	JOIN "user" u ON u.id = m.sender_id
`

type messageRow struct {
	ID             string    `bun:"id"`
	ConversationID string    `bun:"conversation_id"`
	SenderID       string    `bun:"sender_id"`
	SenderName     string    `bun:"sender_name"`
	Content        string    `bun:"content"`
	ImageKey       *string   `bun:"image_key"`
	CreatedAt      time.Time `bun:"created_at"`
}

// toOut resolves ImageKey to a viewable URL the same way stories.go's
// listStories does (storage.Client.PublicURL) — nil Storage or nil
// ImageKey both just mean "no image", not an error.
func (h *Handlers) messageRowToOut(ctx context.Context, row messageRow) (messageOut, error) {
	out := messageOut{
		ID: row.ID, ConversationID: row.ConversationID, SenderID: row.SenderID, SenderName: row.SenderName,
		Content: row.Content, CreatedAt: row.CreatedAt,
	}
	if row.ImageKey != nil && h.Storage != nil {
		url, err := h.Storage.PublicURL(ctx, *row.ImageKey)
		if err != nil {
			return messageOut{}, err
		}
		out.ImageURL = &url
	}
	return out, nil
}

func (h *Handlers) listMessages(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	conversationID := r.PathValue("id")
	member, err := h.isMember(ctx, conversationID, user.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if !member {
		writeError(w, http.StatusForbidden, "Not a member of this conversation")
		return
	}

	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 && n < 50 {
			limit = n
		}
	}

	query := messageSelect + ` WHERE m.conversation_id = ?`
	args := []any{conversationID}
	if before := r.URL.Query().Get("before"); before != "" {
		query += ` AND m.created_at < (SELECT created_at FROM messages WHERE id = ?)`
		args = append(args, before)
	}
	query += ` ORDER BY m.created_at DESC LIMIT ?`
	args = append(args, limit)

	var rows []messageRow
	if err := h.DB.NewRaw(query, args...).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}
	out := make([]messageOut, len(rows))
	for i, row := range rows {
		m, err := h.messageRowToOut(ctx, row)
		if err != nil {
			writeInternalError(w, err)
			return
		}
		out[i] = m
	}
	writeJSON(w, http.StatusOK, map[string]any{"messages": out})
}

func (h *Handlers) createMessage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	conversationID := r.PathValue("id")
	member, err := h.isMember(ctx, conversationID, user.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if !member {
		writeError(w, http.StatusForbidden, "Not a member of this conversation")
		return
	}

	var body struct {
		Content  string `json:"content"`
		ImageKey string `json:"imageKey"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusUnprocessableEntity, "invalid body")
		return
	}
	content := strings.TrimSpace(body.Content)
	if content == "" && body.ImageKey == "" {
		writeError(w, http.StatusUnprocessableEntity, "content or imageKey is required")
		return
	}

	msg := &dbpkg.Message{ID: newID("msg"), ConversationID: conversationID, SenderID: user.ID, Content: content}
	if body.ImageKey != "" {
		msg.ImageKey = &body.ImageKey
	}
	if _, err := h.DB.NewInsert().Model(msg).Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	out, err := h.messageRowToOut(ctx, messageRow{
		ID: msg.ID, ConversationID: msg.ConversationID, SenderID: msg.SenderID, SenderName: user.Name,
		Content: msg.Content, ImageKey: msg.ImageKey, CreatedAt: msg.CreatedAt,
	})
	if err != nil {
		writeInternalError(w, err)
		return
	}
	h.broadcast(ctx, conversationID, map[string]any{"type": "message_created", "conversationId": conversationID, "message": out})
	writeJSON(w, http.StatusCreated, map[string]any{"message": out})
}

type memberOut struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Role       string    `json:"role"`
	JoinedAt   time.Time `json:"joinedAt"`
	LastReadAt time.Time `json:"lastReadAt"`
}

const memberSelect = `
	SELECT u.id AS id, u.name AS name, cm.role AS role, cm.joined_at AS joined_at, cm.last_read_at AS last_read_at
	FROM conversation_members cm
	JOIN "user" u ON u.id = cm.user_id
	WHERE cm.conversation_id = ?
	ORDER BY cm.joined_at ASC
`

type memberRow struct {
	ID         string    `bun:"id"`
	Name       string    `bun:"name"`
	Role       string    `bun:"role"`
	JoinedAt   time.Time `bun:"joined_at"`
	LastReadAt time.Time `bun:"last_read_at"`
}

func (h *Handlers) listMembers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	conversationID := r.PathValue("id")
	member, err := h.isMember(ctx, conversationID, user.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if !member {
		writeError(w, http.StatusForbidden, "Not a member of this conversation")
		return
	}

	var rows []memberRow
	if err := h.DB.NewRaw(memberSelect, conversationID).Scan(ctx, &rows); err != nil {
		writeInternalError(w, err)
		return
	}
	out := make([]memberOut, len(rows))
	for i, row := range rows {
		out[i] = memberOut{ID: row.ID, Name: row.Name, Role: row.Role, JoinedAt: row.JoinedAt, LastReadAt: row.LastReadAt}
	}
	writeJSON(w, http.StatusOK, map[string]any{"members": out})
}

// markRead advances the caller's read cursor to now — read status is derived
// (a message is "read by" a member once that member's last_read_at passes
// the message's created_at, see memberOut.LastReadAt above), not tracked per
// message-per-user, so this is the one write that keeps it current. Broadcasts
// so any other device/tab with this conversation open updates its checkmarks
// live without polling.
func (h *Handlers) markRead(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	conversationID := r.PathValue("id")
	member, err := h.isMember(ctx, conversationID, user.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if !member {
		writeError(w, http.StatusForbidden, "Not a member of this conversation")
		return
	}

	readAt := time.Now().UTC()
	if _, err := h.DB.NewUpdate().
		Model((*dbpkg.ConversationMember)(nil)).
		Set("last_read_at = ?", readAt).
		Where("conversation_id = ? AND user_id = ?", conversationID, user.ID).
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	h.broadcast(ctx, conversationID, map[string]any{
		"type": "read_receipt", "conversationId": conversationID, "userId": user.ID, "readAt": readAt,
	})
	writeJSON(w, http.StatusOK, map[string]any{"readAt": readAt})
}

func (h *Handlers) inviteMember(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	conversationID := r.PathValue("id")
	var convo dbpkg.Conversation
	if err := h.DB.NewSelect().Model(&convo).Where("id = ?", conversationID).Scan(ctx); err != nil {
		if err == sql.ErrNoRows {
			writeError(w, http.StatusNotFound, "Conversation not found")
			return
		}
		writeInternalError(w, err)
		return
	}
	if convo.Type != "group" {
		writeError(w, http.StatusUnprocessableEntity, "Only group conversations support invites")
		return
	}

	role, err := h.memberRole(ctx, conversationID, user.ID)
	if err != nil && err != sql.ErrNoRows {
		writeInternalError(w, err)
		return
	}
	if role != "owner" {
		writeError(w, http.StatusForbidden, "Only the group owner can invite members")
		return
	}

	var body struct {
		UserID string `json:"userId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.UserID == "" {
		writeError(w, http.StatusUnprocessableEntity, "userId is required")
		return
	}

	// ON CONFLICT DO NOTHING — inviting someone already in the group is a
	// harmless no-op, not an error; the re-read below returns the truth
	// either way (same idempotency lesson as clubs.go's joinClub).
	if _, err := h.DB.NewInsert().
		Model(&dbpkg.ConversationMember{ConversationID: conversationID, UserID: body.UserID, Role: "member"}).
		On("CONFLICT (conversation_id, user_id) DO NOTHING").
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}

	out, err := h.getConversationByID(ctx, conversationID, user.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"conversation": out})
}

// leaveConversation is deliberately simple, mirroring clubs.go's
// leaveClub: a group owner who wants to leave must hand off ownership
// first (no such endpoint exists yet — same gap clubs.go's changeLeader
// fills for clubs; a follow-up, not required for this task) — no
// auto-reassignment.
func (h *Handlers) leaveConversation(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	conversationID := r.PathValue("id")
	var convo dbpkg.Conversation
	if err := h.DB.NewSelect().Model(&convo).Where("id = ?", conversationID).Scan(ctx); err != nil {
		if err == sql.ErrNoRows {
			writeError(w, http.StatusNotFound, "Conversation not found")
			return
		}
		writeInternalError(w, err)
		return
	}

	role, err := h.memberRole(ctx, conversationID, user.ID)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusForbidden, "Not a member of this conversation")
		return
	}
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if convo.Type == "group" && role == "owner" {
		writeError(w, http.StatusUnprocessableEntity, "Owner must hand off leadership before leaving")
		return
	}

	if _, err := h.DB.NewDelete().
		Model((*dbpkg.ConversationMember)(nil)).
		Where("conversation_id = ? AND user_id = ?", conversationID, user.ID).
		Exec(ctx); err != nil {
		writeInternalError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"left": true})
}

// getUploadURL mirrors internal/stories' handler of the same name exactly
// (step 1 of 2 — presigned PUT URL, nothing written to the DB here, an
// abandoned upload just leaves a harmless orphaned R2 object) with one
// difference: the caller must already be a member of the conversation
// they're about to post an image into.
func (h *Handlers) getUploadURL(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, ok := authcheck.RequireUser(ctx, h.DB, r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	conversationID := r.PathValue("id")
	member, err := h.isMember(ctx, conversationID, user.ID)
	if err != nil {
		writeInternalError(w, err)
		return
	}
	if !member {
		writeError(w, http.StatusForbidden, "Not a member of this conversation")
		return
	}

	if h.Storage == nil {
		writeError(w, http.StatusServiceUnavailable, "Image upload is not configured")
		return
	}

	var body struct {
		MediaType   string `json:"mediaType"`   // "image" | "video"
		ContentType string `json:"contentType"` // e.g. "image/jpeg" — must match the actual upload's Content-Type header exactly, the signature covers it
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil ||
		(body.MediaType != "image" && body.MediaType != "video") || body.ContentType == "" {
		writeError(w, http.StatusUnprocessableEntity, "mediaType (image|video) and contentType are required")
		return
	}

	ext := extForContentType(body.ContentType)
	objectKey := user.ID + "/" + newID("chatmsg") + ext

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
