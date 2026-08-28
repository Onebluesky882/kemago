# backend — TODO

Checklist for the Go backend (`api-go` + `ws-go`), grouped by area. Update the status when scope changes — don't leave it stale.

Legend: `[x]` done · `[~]` partial / mocked · `[ ]` not started

---

## api-go (REST API — Fiber v3 + Bun ORM + Postgres + Redis)
- [x] Module scaffolded, builds clean (`go build ./...`, `go vet ./...`, `gofmt` clean)
- [x] Config loader (`internal/config`) — reads `PORT`, `DATABASE_URL`, `REDIS_URL`, `THAIBULK_SMS_KEY`, `THAIBULK_SMS_SECRET`, `SMS_SENDER`, `JWT_SECRET` from env
- [x] Postgres connection via Bun + pgdriver (`internal/db`), `User` model, bootstrap `CREATE TABLE IF NOT EXISTS` migration
- [x] Redis client (`internal/redisclient`)
- [x] `GET /health`
- [x] Bearer/JWT issuance (`internal/authtoken`, minimal HS256 via `golang-jwt/jwt/v5`) — OTP verify success upserts the user (Bun) and returns a real token; `RequireAuth` middleware + `GET /api/me` prove it end-to-end
- [ ] Real routes for Feed/Events/Jobs/Sport/Clubs/Chat/Profile per stage-7..10 — none exist yet, this stage only covers OTP auth
- [ ] Swap the bootstrap `db.Migrate` for a real migration tool (bun/migrate or similar) once schema changes need to be tracked across environments
- [ ] No refresh tokens / revocation yet — `authtoken` is deliberately minimal (30-day HS256, no rotation). Considered Authula (github.com/Authula/authula, Go, Fiber v3, Bun-backed) for this but its jwt plugin requires adopting its session plugin + JWKS key rotation + its own migration set too — too much for what's needed right now. Revisit if refresh/rotation becomes a real requirement.

## OTP / identity verification (`internal/otp`, `internal/sms`, `internal/email`)
Architecture: `otp.Service` owns cross-cutting concerns (request cooldown, attempt limiting, session storage in Redis) and delegates the actual code generation/delivery/checking to a pluggable `otp.Provider` (`Send(ctx, identifier) (session, error)` / `Validate(ctx, session, code) (bool, error)`). Swapping providers is a one-line change in `main.go`. The HTTP contract (`identifier` + `code` fields) doesn't change no matter which is active.

**Providers built (only one active at a time, chosen in `main.go`):**
- [x] `EmailOTPProvider` (`internal/otp/email_provider.go`) — **ACTIVE**. Generates the code ourselves, delivers via `internal/email` (Resend). Chosen to avoid per-message SMS cost while volume is low.
- [x] `SMSMKTOTPProvider` (`internal/otp/smsmkt_provider.go`) — SMSMKT's *managed* OTP product (they generate/verify, we just hold their `token`). Built and **verified with a real SMS delivered to the client's real phone** before switching to email. Deliberate exception to "keep OTP logic ours" — chosen at the time for fast testing since this OTP Project was already approved (no sender-name wait). `ref_code` in their response is typed loosely (`json.RawMessage`) because their docs show it as an int but live responses return a string — a real decode bug hit and fixed during testing.
- [x] `SelfGenProvider` (`internal/otp/selfgen_provider.go`) — our own Redis-backed codes over any `sms.Sender` (ThaiBulkSMS or SMSMKT's plain send-message API). Original stage-12/13 design, not currently active.
- [x] `internal/sms/thaibulksms.go` — ThaiBulkSMS API v2 client, built against their actual developer manual (API-v2-th.pdf). Sender name confirmed valid ("Demo"); blocked on 0 account credit, never actually delivered an SMS.
- [x] `internal/sms/smsmkt.go` — SMSMKT's plain send-message API (`POST /api/send-message`), confirmed working shape via live requests, but **no approved sender name exists yet** (pending NBTC approval — see below).
- [x] `internal/email/resend.go` — Resend REST API client (same provider `packages/email`, the original TS backend, already uses — just a native Go client since this backend can't import a TS package).

- [x] `POST /api/otp/request`, `POST /api/otp/verify` (body field renamed `phone` → `identifier`, now provider-agnostic) — verified end-to-end multiple times across provider swaps (correct code → token issued + `/api/me` accepts it; wrong code → 401; reused code → 404 single-use; rollback on send failure confirmed with real ThaiBulkSMS *and* SMSMKT rejections)
- [x] `GET/POST /api/otp` — ThaiBulkSMS delivery-report webhook receiver (matches the URL already registered in their dashboard); currently just 200s, doesn't persist delivery status. Harmless no-op while email is active.
- [x] `db.User.Identifier` (renamed from `Phone`) — same column now holds an email or a phone number depending on the active provider; not split into separate columns until both need to coexist on one account
- [ ] **Not yet verified: a real email actually arriving.** The container starts cleanly with `RESEND_API_KEY` set and the request path is unchanged from the (SMS-tested) working flow, but no live `/api/otp/request` call has been made against the email provider yet — waiting on a real email address to test with.
- [ ] Daily per-identifier request cap (currently only a 60s cooldown — no cap on total requests/day, the real cost/abuse guard)
- [ ] SMSMKT sender name for the plain send-message path: no approved name exists on this account. Rules confirmed (4-10 chars, English letters+numbers only, no spaces, NBTC-regulated approval process) — "Coarea" fits and could be submitted, but this is a business process with a client, not something to code around.
- [ ] ThaiBulkSMS: sender name confirmed valid, but account credit is 0 — top up to actually test SMS delivery on that path
- [ ] `EMAIL_FROM` defaults to Resend's `onboarding@resend.dev` test sender (works without domain verification) — needs a verified custom domain before real users see it

## ws-go (separate WebSocket service)
- [x] Module scaffolded, builds clean
- [x] Plain `net/http` + `github.com/coder/websocket` (NOT Fiber — `gofiber/contrib/websocket` only supports Fiber v2, and Fiber v3 core has no websocket middleware yet)
- [x] `GET /health`
- [x] `GET /ws?room=<id>` — in-memory single-instance room broadcast hub (`internal/hub`)
- [ ] Auth — room currently comes from an unauthenticated query param; once Bearer auth exists (it does now, see `authtoken`), verify the token here too and derive room membership from the user's actual conversations
- [ ] Multi-instance scaling — hub is in-process only; move broadcasts through Redis pub/sub before running more than one replica
- [ ] Wire to `apps/mobile`'s Chat tab (stage-10-chat)

## Infra (`docker-compose.yml`, root `.env`)
- [x] `docker-compose.yml` at repo root: postgres, redis, api, ws services, `.env` auto-loaded (Compose picks up a root `.env` automatically)
- [x] `.env.example` committed as the template; real `.env` is gitignored
- [x] `docker compose config` validates
- [x] **Verified end-to-end with OrbStack running:** `docker compose up -d --build` — all 4 containers up, postgres/redis healthy, api/ws `/health` respond `{"status":"ok"}`, full OTP→JWT→protected-route flow tested live
- [ ] Self-host deploy checklist (per DECISIONS.md → Coarea Tech Stack consequences) — not written yet
