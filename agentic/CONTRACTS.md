# CONTRACTS.md

## Purpose

Define the public interfaces between modules. All contracts below are initial/draft — Conductor must refine field-level detail with the assigned worker before implementation of each module begins.

⸻

## Module: Auth

**Implemented** on `backend/better-auth` (Bun/TypeScript/Drizzle/Postgres) — the **only** domain this service owns, per DECISIONS.md → "Backend Domain Ownership — TypeScript Is Auth-Only". Two sign-in methods, both returning the same `{ token, user }` shape:
- Email OTP (stage-14/15/16): `POST /api/auth/email-otp/send-verification-otp` → `POST /api/auth/sign-in/email-otp`
- Email + password (stage-21): `POST /api/auth/sign-up/email`, `POST /api/auth/sign-in/email`

Plus `GET /api/auth/get-session`, `POST /api/auth/update-user`, `POST /api/auth/sign-out` — all Better Auth's own built-ins, not custom code. Deviates from the draft below (`/v1/auth/register`+`/v1/auth/login`) since Better Auth owns the whole CRUD lifecycle itself; see stage-16/21 for why.

### Errors
- `401` invalid credentials
- `422` USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL, validation errors (Better Auth's own error codes, not custom ones)

⸻

## Module: Feed

**Implemented** (stage-20, moved to Go in stage-22) on `backend/api-go` — Go owns every domain except auth, per DECISIONS.md → "Backend Domain Ownership — TypeScript Is Auth-Only". Deviates from the original draft below: no `area`/pagination yet (no location model exists — see `coarea_product_rules` memory), and the base path is `/api/posts` not `/v1/feed` (matching this service's existing `/api/*` convention). Every post belongs to a room (see Module: Room) — defaults to the "general" room, auto-created on first use, if the caller doesn't specify one.

### Input
- `GET /api/posts?room_id=<optional>` — list posts, newest first
- `GET /api/posts/:id` — a single post
- `POST /api/posts` (Bearer required) — `{ roomId?, category, body }`

### Output
- `{ posts: [{ id, roomId, author, authorVerified, category, body, createdAt, likeCount, replyCount }] }`
- `{ post: { ...same shape } }`

### Errors
- `401` missing/invalid token
- `404` post not found
- `422` validation error (missing `category`/`body`)

**Not yet implemented:** `area`/location filtering (Feed's `roomId` and Event/Profile-style location are different concerns — a room is a named space, not a geography), pagination (`cursor`), AI pre-publish moderation (blocked on the prohibited-content list, per memory).

⸻

## Module: Comment

**Implemented** (stage-20, moved to Go in stage-22) on `backend/api-go`, alongside Feed above.

### Input
- `GET /api/posts/:id/comments` — list a post's comments, oldest first
- `POST /api/posts/:id/comments` (Bearer required) — `{ body }`

### Output
- `{ comments: [{ id, author, authorVerified, body, createdAt }] }`
- `{ comment: { ...same shape } }`

### Errors
- `401` missing/invalid token
- `404` post not found
- `422` validation error (missing/empty `body`)

⸻

## Module: Room

**Implemented** (stage-22) on `backend/api-go`. Not in the original draft set — added directly by the client as a relation for Feed to belong to. A "general" room is auto-created (idempotent, `ON CONFLICT DO NOTHING`) the first time anyone posts without specifying a `roomId`.

### Input
- `GET /api/rooms` — list rooms
- `POST /api/rooms` (Bearer required) — `{ name }`

### Output
- `{ rooms: [{ id, name }] }`
- `{ room: { id, name } }`

### Errors
- `401` missing/invalid token
- `422` validation error (missing `name`)

⸻

## Module: Like

**Implemented** (stage-22) on `backend/api-go`. A join table between `posts` and the auth-owned `"user"` table (`PRIMARY KEY (post_id, user_id)`) — one like per person per post. `Post.likeCount` (Module: Feed) is a live `count(*)` over this table, not a stored counter.

### Input
- `POST /api/posts/:id/like` (Bearer required) — idempotent, no body
- `DELETE /api/posts/:id/like` (Bearer required) — idempotent, no body

### Output
- `{ liked: true }` / `{ liked: false }`

### Errors
- `401` missing/invalid token
- `404` post not found (like only; unlike doesn't check — deleting a non-existent like is a no-op)

⸻

## Module: Event

### Input
- `GET /v1/events?area=<id>` — list local events/missions
- `POST /v1/events` (Bearer required) — `{ title, description, startAt, endAt, area }`
- `POST /v1/events/:id/join` (Bearer required)

### Output
- `{ events: [{ id, title, description, startAt, endAt, area, participantCount }] }`

### Errors
- `401` missing/invalid token
- `404` event not found
- `422` validation error

⸻

## Module: Profile

### Input
- `GET /v1/users/me` (Bearer required)
- `PATCH /v1/users/me` (Bearer required) — `{ name?, avatarUrl?, bio? }`

### Output
- `{ id, email, name, avatarUrl, bio, createdAt }`

### Errors
- `401` missing/invalid token
- `422` validation error

⸻

## Module: Chat

### Input
- `GET /v1/chats` (Bearer required) — list conversations
- `GET /v1/chats/:id/messages` (Bearer required)
- `POST /v1/chats/:id/messages` (Bearer required) — `{ content }`

### Output
- `{ chats: [{ id, participants, lastMessage, updatedAt }] }`
- `{ messages: [{ id, sender, content, createdAt }] }`

### Errors
- `401` missing/invalid token
- `403` not a participant in this chat
- `404` chat not found

⸻

<!-- Add one section per module -->
