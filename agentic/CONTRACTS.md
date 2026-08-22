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

### Input
- `GET /v1/feed?area=<id>&cursor=<cursor>` — list local posts
- `POST /v1/feed` (Bearer required) — `{ content, mediaUrls?, area }`

### Output
- `{ posts: [{ id, author, content, mediaUrls, area, createdAt }], nextCursor }`

### Errors
- `401` missing/invalid token
- `422` validation error

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
