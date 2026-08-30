# CONTRACTS.md

## Purpose

Define the public interfaces between modules. All contracts below are initial/draft — Conductor must refine field-level detail with the assigned worker before implementation of each module begins.

⸻

## Module: Auth

### Input
- `POST /v1/auth/register` — `{ email, password, name }`
- `POST /v1/auth/login` — `{ email, password }`

### Output
- `{ user: { id, email, name }, token: string }`

### Errors
- `401` invalid credentials
- `409` email already registered
- `422` validation error (structured field errors)

⸻

## Module: Feed

**Implemented** (stage-20-post-comment-system) on `backend/better-auth` — the only live backend, so it hosts this alongside auth rather than a separate Feed service. Deviates from the original draft below: no `area`/pagination yet (no location model exists — see `coarea_product_rules` memory), and the base path is `/api/posts` not `/v1/feed` (matching this service's existing `/api/*` convention, not the `/v1/*` one assumed when this contract was first drafted).

### Input
- `GET /api/posts` — list all posts, newest first
- `GET /api/posts/:id` — a single post
- `POST /api/posts` (Bearer required) — `{ category, body }`

### Output
- `{ posts: [{ id, author, authorVerified, category, body, createdAt, likeCount, replyCount }] }`
- `{ post: { ...same shape } }`

### Errors
- `401` missing/invalid token
- `404` post not found
- `422` validation error (missing `category`/`body`)

**Not yet implemented:** `area`/location filtering, pagination (`cursor`), likes (write path — `likeCount` is present in the response but always `0`), AI pre-publish moderation (blocked on the prohibited-content list, per memory).

⸻

## Module: Comment

**Implemented** (stage-20-post-comment-system) on `backend/better-auth`, alongside Feed above.

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
