# backend — TODO

Checklist for the Go backend (`api-go` + `ws-go`), grouped by area. Update the status when scope changes — don't leave it stale.

Legend: `[x]` done · `[~]` partial / mocked · `[ ]` not started

---

## api-go (REST API — Fiber v3 + Bun ORM + Postgres + Redis)
- [x] Module scaffolded, builds clean (`go build ./...`, `go vet ./...`, `gofmt` clean)
- [x] Config loader (`internal/config`) — reads `PORT`, `DATABASE_URL`, `REDIS_URL`, `THAIBULK_SMS_KEY`, `THAIBULK_SMS_SECRET`, `SMS_SENDER` from env
- [x] Postgres connection via Bun + pgdriver (`internal/db`), `User` model, bootstrap `CREATE TABLE IF NOT EXISTS` migration
- [x] Redis client (`internal/redisclient`)
- [x] `GET /health`
- [ ] Real routes for Feed/Events/Jobs/Sport/Clubs/Chat/Profile per stage-7..10 — none exist yet, this stage only covers OTP auth
- [ ] Bearer/JWT issuance — OTP verify currently just returns `{"verified": true}`, doesn't create a session or token yet (see `internal/handlers/otp.go` TODO)
- [ ] Swap the bootstrap `db.Migrate` for a real migration tool (bun/migrate or similar) once schema changes need to be tracked across environments

## OTP / phone verification (`internal/otp`, `internal/sms`)
- [x] `internal/sms` — ThaiBulkSMS API v2 client (`POST https://api-v2.thaibulksms.com/sms`, Basic Auth, form body), built against their actual developer manual (API-v2-th.pdf), not guessed
- [x] `internal/otp` — generate 6-digit code, store in Redis (5 min TTL), 60s request cooldown per phone, 5-attempt verify limit
- [x] `POST /api/otp/request`, `POST /api/otp/verify`
- [x] `GET/POST /api/otp` — ThaiBulkSMS delivery-report webhook receiver (matches the URL already registered in their dashboard for this app); currently just 200s, doesn't persist delivery status
- [ ] Daily per-phone request cap (currently only a 60s cooldown — no cap on total requests/day, which is the real cost-abuse guard)
- [ ] Persist delivery status against the outbound message_id once sends are logged in Postgres
- [ ] Decide whether to eventually switch to ThaiBulkSMS's own managed "SMS OTP Ready to Use" product instead of this self-built flow — public docs didn't expose its API contract when this was scaffolded; the self-built version was chosen so swapping providers later doesn't touch auth logic
- [ ] Compare against Thaibulksms's tiered/volume pricing vs. THSMS's flat 0.5 THB/message once real send volume is known

## ws-go (separate WebSocket service)
- [x] Module scaffolded, builds clean
- [x] Plain `net/http` + `github.com/coder/websocket` (NOT Fiber — `gofiber/contrib/websocket` only supports Fiber v2, and Fiber v3 core has no websocket middleware yet)
- [x] `GET /health`
- [x] `GET /ws?room=<id>` — in-memory single-instance room broadcast hub (`internal/hub`)
- [ ] Auth — room currently comes from an unauthenticated query param; once Bearer auth exists, verify the token and derive room membership from the user's actual conversations
- [ ] Multi-instance scaling — hub is in-process only; move broadcasts through Redis pub/sub before running more than one replica
- [ ] Wire to `apps/mobile`'s Chat tab (stage-10-chat)

## Infra (`docker-compose.yml`, root `.env`)
- [x] `docker-compose.yml` at repo root: postgres, redis, api, ws services, `.env` auto-loaded (Compose picks up a root `.env` automatically)
- [x] `.env.example` committed as the template; real `.env` is gitignored
- [x] `docker compose config` validates
- [ ] **Not yet verified end-to-end** — OrbStack daemon wasn't running when this was built (`docker compose up` failed: docker socket not found). Run `docker compose up -d --build` once OrbStack is running and confirm all 4 containers come up healthy
- [ ] Self-host deploy checklist (per DECISIONS.md → Coarea Tech Stack consequences) — not written yet
