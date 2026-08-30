# CONTRACTS.md

## Purpose

Define the public interfaces between modules. All contracts below are initial/draft — Conductor must refine field-level detail with the assigned worker before implementation of each module begins.

⸻

## Module: Auth

**Implemented** on `backend/better-auth` (Bun/TypeScript/Drizzle/Postgres) — the **only** domain this service owns, per DECISIONS.md → "Backend Domain Ownership — TypeScript Is Auth-Only". Two sign-in methods, both returning the same `{ token, user }` shape:
- Email OTP (stage-14/15/16): `POST /api/auth/email-otp/send-verification-otp` → `POST /api/auth/sign-in/email-otp`
- Email + password (stage-21): `POST /api/auth/sign-up/email`, `POST /api/auth/sign-in/email`

Plus `GET /api/auth/get-session`, `POST /api/auth/update-user`, `POST /api/auth/sign-out` — all Better Auth's own built-ins, not custom code. Deviates from the draft below (`/v1/auth/register`+`/v1/auth/login`) since Better Auth owns the whole CRUD lifecycle itself; see stage-16/21 for why.

The `user` object returned by every auth endpoint also carries `profileComplete: boolean` (stage-16) and `profilePublic: boolean` (stage-24, defaults `true`) — both plain columns on the `user` table, both written via `POST /api/auth/update-user` like any other Better Auth field.

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
- `{ posts: [{ id, roomId, authorId, author, authorVerified, category, body, createdAt, likeCount, replyCount, hasPoll }] }`
- `{ post: { ...same shape } }`

### Errors
- `401` missing/invalid token
- `404` post not found
- `422` validation error (missing `category`/`body`)

**Not yet implemented:** `area`/location filtering (Feed's `roomId` and Event/Profile-style location are different concerns — a room is a named space, not a geography), pagination (`cursor`), AI pre-publish moderation (blocked on the prohibited-content list, per memory).

**Stage-24 addition:** `GET /api/posts` now silently drops posts authored by anyone the caller has blocked (Module: Block below) when a valid Bearer token is present — anonymous callers see everything. `authorId` was added to the response specifically so the mobile client can target a block action at a post's author.

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

**Implemented** (stage-22, membership added in stage-25) on `backend/api-go`. Not in the original draft set — added directly by the client as a relation for Feed to belong to. A "general" room is auto-created (idempotent, `ON CONFLICT DO NOTHING`) the first time anyone posts without specifying a `roomId`. Creating a room auto-joins the creator, mirroring Club's pattern.

### Input
- `GET /api/rooms` — list rooms; personalizes `joined` if a Bearer token is present, otherwise `false`
- `POST /api/rooms` (Bearer required) — `{ name }` — auto-joins the creator
- `POST /api/rooms/:id/join` (Bearer required) — idempotent
- `POST /api/rooms/:id/leave` (Bearer required) — idempotent
- `GET /api/rooms/:id/members` — list members, no auth required

### Output
- `{ rooms: [{ id, name, memberCount, joined }] }`
- `{ room: { ...same shape } }`
- `{ members: [{ id, name, verified, joinedAt }] }`

### Errors
- `401` missing/invalid token
- `422` validation error (missing `name`)

**Mobile (stage-27):** `roomsApi.ts` + a new `Rooms` screen (list/create/join/leave, reachable from Profile — no dedicated tab, unlike Clubs) and a room-detail members list.

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

## Module: Club

**Implemented** (stage-24) on `backend/api-go`. Anyone can create a club (becomes its leader + first member); anyone can join/leave; only the current leader can hand off leadership. No identity-verification gate on who can create one — that's a separate, unresolved product decision (see `coarea_product_rules` memory), deliberately out of scope here.

### Input
- `GET /api/clubs` — list all clubs; personalizes `joined` if a Bearer token is present, otherwise `false`
- `POST /api/clubs` (Bearer required) — `{ name, description?, category? }` — creates the club and auto-joins the creator as leader
- `POST /api/clubs/:id/join` (Bearer required) — idempotent
- `POST /api/clubs/:id/leave` (Bearer required) — `422` if the caller is the current leader (no auto-reassignment)
- `PATCH /api/clubs/:id/leader` (Bearer required) — `{ userId }` — `403` if the caller isn't the current leader, `422` if the target isn't already a member

### Output
- `{ clubs: [{ id, name, description, category, leaderId, leaderName, memberCount, joined, createdAt }] }`
- `{ club: { ...same shape } }`

### Errors
- `401` missing/invalid token
- `403` not the current leader (leader-change only)
- `404` club not found
- `422` validation error / leader trying to leave / target not a member

⸻

## Module: Poll

**Implemented** (stage-24) on `backend/api-go`, one poll per post (`polls.post_id` is `UNIQUE`).

### Input
- `POST /api/posts/:id/poll` (Bearer required) — `{ question, options: string[] }` (min 2 options)
- `GET /api/posts/:id/poll` — the poll + live vote counts; `myVoteOptionId` populated only with a valid Bearer token
- `POST /api/posts/:id/poll/vote` (Bearer required) — `{ optionId }` — upserts the caller's vote (voting again changes it, doesn't add a second vote)

### Output
- `{ poll: { id, postId, question, options: [{ id, label, voteCount }], totalVotes, myVoteOptionId } }`

### Errors
- `401` missing/invalid token
- `404` post not found, post has no poll, or option not found
- `422` fewer than 2 options, or a post that already has a poll

**Integrated (stage-31):** `POST /api/posts/:id/poll` now also broadcasts `{ type: "poll_added", postId }` on Module: Feed's shared `"feed:all"` realtime channel (see Module: Realtime), and Module: Feed's `postOut` gained `hasPoll: boolean`. Mobile's `PostCard`/`PostDetailScreen` render `PollCard` when `hasPoll` is true, and show a "+ Add poll" toggle (opens `PollComposer`) when it's false and the viewer is signed in — any signed-in user can attach a poll to any post, not just their own, matching this module's existing authorization (no ownership check on `createPoll`).

⸻

## Module: Block

**Implemented** (stage-24) on `backend/api-go`. Blocking is one-directional (only the blocker's own feed is filtered) and immediately affects `GET /api/posts` (see Module: Feed's stage-24 addition).

### Input
- `POST /api/blocks` (Bearer required) — `{ userId }` — idempotent; `422` on self-block
- `DELETE /api/blocks/:userId` (Bearer required) — idempotent no-op if not blocked
- `GET /api/blocks` (Bearer required) — everyone the caller has blocked

### Output
- `{ blocked: [{ id, name, blockedAt }] }`
- `{ blocked: true }` / `{ blocked: false }` (block/unblock responses)

### Errors
- `401` missing/invalid token
- `422` blocking yourself

⸻

## Module: Friend

**Implemented** (stage-25) on `backend/api-go`. A mutual request flow, not a one-directional "follow" — sending a request to someone who already requested you resolves to an immediate "accepted" rather than creating a redundant second row.

### Input
- `POST /api/friends/requests` (Bearer required) — `{ userId }` — sends a request, or auto-accepts if `userId` already requested the caller
- `POST /api/friends/requests/:userId/accept` (Bearer required) — accepts a pending request from `:userId`
- `POST /api/friends/requests/:userId/decline` (Bearer required) — deletes a pending request from `:userId` (no history kept)
- `GET /api/friends/requests` (Bearer required) — incoming pending requests
- `DELETE /api/friends/:userId` (Bearer required) — removes an accepted friendship, or cancels a pending request the caller sent
- `GET /api/friends` (Bearer required) — accepted friends

### Output
- `{ userId, status }` (status: `"pending"` / `"accepted"` / `"declined"` / `"removed"`)
- `{ requests: [{ userId, name, verified, createdAt }] }`
- `{ friends: [{ userId, name, verified, createdAt }] }` (`createdAt` here is when the friendship was accepted, not when first requested)

### Errors
- `401` missing/invalid token
- `404` no pending request found to accept
- `422` friending yourself, already friends, or a request already sent

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

## Module: Realtime

**Implemented** (stage-29) on `backend/api-go`'s existing websocket hub (`internal/hub`, built in stage-12 for chat). Every connection joins exactly one channel:

### Input
- `GET /ws?token=<bearer>` (upgrades to websocket) — personal channel, server-derives room `"user:<id>"` from the verified token (never trusts a client-supplied id)
- `GET /ws?room=<id>` (upgrades to websocket) — the original unauthenticated raw chat relay from stage-12, unrelated to the events below (see Module: Chat's own TODO)

### Output (JSON text frames pushed by the server, not requested by the client)
On the personal channel:
- `{ type: "friend_request", from: { userId, name } }`
- `{ type: "friend_accepted", by: { userId, name } }`

On the shared `"feed:all"` channel (join via `?room=feed:all` — not per-room, since Feed's own list mixes every room together):
- `{ type: "post_created", post: {...same shape as Module: Feed's post} }`
- `{ type: "comment_created", postId, comment: {...same shape as Module: Comment} }`
- `{ type: "like_changed", postId, likeCount }`
- `{ type: "poll_added", postId }` (stage-31 — sent by `internal/polls`, not `internal/feed`, but on the same shared channel)

### Errors
- `401` invalid token (only on the `?token=` path)

**Not yet covered:** clubs, polls, rooms, blocks have no real-time events.

⸻

## Module: Story

**Implemented** (stage-30) on `backend/api-go` (`internal/stories`) — IG-style ephemeral (24h) photo/video posts. **Optional at runtime:** disabled entirely (`/api/stories*` 404s) unless `R2_ACCOUNT_ID` etc. are set — see `.env.example`. Uploads never pass through this backend: the client gets a presigned PUT URL, uploads straight to Cloudflare R2 (S3-compatible), then registers the story.

### Input
- `POST /api/stories/upload-url` (Bearer required) — `{ mediaType: "image"|"video", contentType }` → a presigned PUT URL (15 min) + the `objectKey` to use in the next call
- `POST /api/stories` (Bearer required) — `{ objectKey, mediaType }` — called after the client's direct PUT to R2 succeeds; sets `expiresAt` to 24h from now
- `GET /api/stories` — every non-expired story, no auth required (same no-login-wall read pattern as Feed)

### Output
- `{ uploadUrl, objectKey }`
- `{ story: { id, authorId, author, authorVerified, mediaUrl, mediaType, createdAt, expiresAt } }`
- `{ stories: [{ ...same shape }] }`

### Errors
- `401` missing/invalid token (write endpoints only)
- `422` invalid/missing `mediaType`/`contentType`/`objectKey`

**Not yet built:** view tracking (who saw a story), story deletion before natural expiry, and expired rows are filtered at read time (`WHERE expires_at > now()`) rather than actually deleted — no cleanup job exists yet, so expired rows and their R2 objects accumulate. Mobile has a single-story-per-author viewer only (`StoriesBar`/`StoryViewer`) — no multi-story-per-author carousel.

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
