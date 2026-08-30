# PIPELINE.md

Status: PLANNING
Owner: CONDUCTOR
Conductor Branch: main

---

## Stage Overview

| Stage | Domain | Depends On | Status |
|-------|--------|------------|--------|
| stage-1-setup | agentic/ (governance) | none | COMPLETE |
| stage-2-slip-verification-service-ts | packages/slip-verification-service | none | COMPLETE |
| stage-3-dependency-updates | root, apps/web, apps/admin, apps/mobile | none | COMPLETE |
| stage-4-backend-scaffold | new Go backend service | stage-1-setup | IN_PROGRESS |
| stage-5-auth | Go backend, apps/mobile | stage-4-backend-scaffold | COMPLETE (via phone-OTP, not register/login — see stage-14) |
| stage-6-mobile-shell | apps/mobile | stage-1-setup | PLANNING |
| stage-7-feed | Go backend, apps/mobile | stage-5-auth, stage-6-mobile-shell | PLANNING |
| stage-8-event | Go backend, apps/mobile | stage-5-auth, stage-6-mobile-shell | PLANNING |
| stage-9-profile | Go backend, apps/mobile | stage-5-auth, stage-6-mobile-shell | PLANNING |
| stage-10-chat | Go backend, apps/mobile | stage-5-auth, stage-6-mobile-shell | PLANNING |
| stage-11-mobile-jobs-sport-clubs | apps/mobile | stage-6-mobile-shell | COMPLETE |
| stage-12-backend-otp-scaffold | backend/api-go, backend/ws-go | stage-1-setup | COMPLETE |
| stage-13-backend-jwt-issuance | backend/api-go | stage-12-backend-otp-scaffold | COMPLETE |
| stage-14-mobile-auth-flow | apps/mobile, backend/api-go | stage-11-mobile-jobs-sport-clubs, stage-13-backend-jwt-issuance | COMPLETE |
| stage-15-otp-provider-abstraction | backend/api-go | stage-14-mobile-auth-flow | COMPLETE (apps/mobile now out of sync — see detail) |
| stage-17-mobile-ios-gitignore | apps/mobile | none | COMPLETE |
| stage-18-rename-project-kemago | repo-wide | none | COMPLETE |
| stage-19-roadmap-backlog-capture | agentic/ROADMAP.md | none | COMPLETE |
| stage-20-post-comment-system | backend/better-auth, apps/mobile | stage-19-roadmap-backlog-capture | SUPERSEDED by stage-22 |
| stage-21-email-password-auth | backend/better-auth | stage-20-post-comment-system | COMPLETE |
| stage-22-go-feed-domain | backend/ws-go, backend/better-auth, apps/mobile | stage-21-email-password-auth | COMPLETE |
| stage-23-rename-ws-go-to-api-go | backend/api-go (formerly ws-go), apps/mobile | stage-22-go-feed-domain | COMPLETE |
| stage-24-clubs-polls-blocks-privacy | backend/api-go, backend/better-auth, apps/mobile | stage-23-rename-ws-go-to-api-go | COMPLETE |
| stage-25-friends-room-membership | backend/api-go, apps/mobile | stage-24-clubs-polls-blocks-privacy | COMPLETE |
| stage-26-friends-ui | apps/mobile | stage-25-friends-room-membership | COMPLETE |
| stage-27-rooms-ui | apps/mobile | stage-26-friends-ui | COMPLETE |

---

## Stage Detail

### stage-1-setup

**Domain:** agentic/ (governance)
**Depends On:** none
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] QUESTIONS.md fully answered (Q0–Q7 + Cloudflare/scope follow-ups)
- [x] PROJECT.md, DECISIONS.md, ARCHITECTURE.md, CONTRACTS.md, PIPELINE.md, ROADMAP.md updated
- [x] conductor-branch placeholder replaced with `main` everywhere

**Done:** Walked the client through QUESTIONS.md (Thai language session). Project: Kemago, a local-first social app (feed/community/events). Client is a developer, mobile-first (Expo/React Native + TypeScript), backend in Go self-hosted via OrbStack, PostgreSQL database — a deliberate deviation from the template's default Hono-on-Cloudflare-Workers/D1 stack (recorded in DECISIONS.md → Kemago Tech Stack). `apps/web`/`apps/admin` deprioritized until client asks. Governance files updated accordingly.
**Next:** Dispatch stage-4-backend-scaffold and stage-6-mobile-shell (independent, can run in parallel — no shared files).
**Blockers:** none

**Dispatch-In:** `tasks/stage-1-setup.md`
**Gate-Out:** `gate-out/stage-1-setup.md`
**Merge-Approval:** `merge-approval/stage-1-setup.md`

---

### stage-2-slip-verification-service-ts

**Domain:** packages/slip-verification-service
**Depends On:** none
**Status:** `COMPLETE`

**Done:** Converted `packages/slip-verification-service` from Go to TypeScript, 1:1 behavior port:
- `src/config.ts` (was `config/config.go`) — env loading with fallbacks
- `src/slip2go/client.ts` (was `slip2go/client.go`) — Slip2Go API client, `matchesWallet`, `last4Digits`
- `src/main.ts` (was `main.go`) — `node:http` server, same routes (`GET /healthz`, `POST /v1/verify-slip`), constant-time internal-secret check via `node:crypto.timingSafeEqual`, graceful shutdown on SIGINT/SIGTERM
- `package.json` / `tsconfig.json` — standalone (not extending `@kemago/config`, kept self-contained so the Dockerfile build context doesn't need the rest of the monorepo), scripts: `dev` (tsx watch), `build` (tsc → `dist/`), `start`
- `Dockerfile` rewritten for Node 22 alpine multi-stage build
- `README.md` run instructions updated to `pnpm install && pnpm dev`
- Removed: `main.go`, `go.mod`, `go.sum`, `config/config.go`, `slip2go/client.go`

Verified: `tsc --noEmit` and `tsc build` pass; ran the built server and confirmed `/healthz`, 403 on missing/wrong `X-Internal-Secret`, 400 on missing `qrCode`, and a live call to Slip2Go's real API all match the original Go behavior byte-for-byte on response shape.

**Next:** Run `pnpm install` at repo root to wire the new package into the workspace lockfile. No CI/deploy pipeline wired up yet for this package specifically (it deploys standalone via its own Dockerfile, same as before).
**Blockers:** none

---

### stage-3-dependency-updates

**Domain:** root, apps/web, apps/admin, apps/mobile
**Depends On:** none
**Status:** `COMPLETE`

**Done:**
- `packageManager` bumped `pnpm@11.6.0` → `pnpm@11.22.0` (root `package.json`); corepack now resolves this version repo-wide
- `tailwindcss` bumped to latest `4.3.3` across all three frontends: `apps/web` (`^4.3.3`), `apps/admin` (`^4.3.3`), `apps/mobile` (`~4.3.3`) — mobile's `uniwind` only requires `tailwindcss >=4`, no conflict
- `apps/mobile` Expo SDK 57 packages aligned via `npx expo install --fix`: `expo@57.0.6` → `~57.0.15`, `expo-router@57.0.6` → `~57.0.15`, `react-native@0.86.0` → `0.86.2`
- Ran `pnpm install` at root; incidentally picked up latest-tagged devDependency bumps (`@biomejs/biome`, `tsx`, `turbo`)

Verified: `pnpm --version` → `11.22.0`; `pnpm ls tailwindcss -r` → `4.3.3` in all three apps; `apps/mobile` `type-check` passes clean.

**Next:** `apps/web` and `apps/admin` `type-check` currently fail with `TS2883` ("inferred type ... cannot be named without a reference to 'Element'") across several components — pre-existing incompatibility between TypeScript 7 and the `@types/react: "latest"` pin, surfaced by this install but unrelated to the dependency bumps above. Needs explicit scoping/approval before fixing (either pin `@types/react` or add explicit return types).
**Blockers:** none for this stage; the TS2883 issue above is a separate follow-up, not yet actioned

---

### stage-4-backend-scaffold

**Domain:** new Go backend service
**Depends On:** stage-1-setup
**Status:** `IN_PROGRESS`

**Acceptance Criteria:**
- [x] Go module scaffolded — location decided: `backend/api-go` (REST API) + `backend/ws-go` (separate WebSocket service, per client request). See stage-12-backend-otp-scaffold for the actual implementation.
- [~] PostgreSQL container running via OrbStack (`docker-compose.yml` at repo root) — migrations tooling is still a bootstrap `CREATE TABLE IF NOT EXISTS` (`backend/api-go/internal/db/models.go`), not a real tool like `golang-migrate` yet
- [x] Health check endpoint — `GET /health` on both services (criteria originally said `/healthz`; `/health` was used instead, no functional difference)
- [ ] CORS policy defined for mobile app origin(s) — not implemented yet, needed before `apps/mobile` calls this API directly
- [~] `gofmt` wired and clean; `go vet` clean. `go test` and `golangci-lint` NOT set up yet — no tests written so far

**Next:** CORS middleware, `golangci-lint` config, first tests, real migration tool. Then stage-5-auth can implement actual Bearer/JWT issuance (stage-12's OTP verify currently just returns `{"verified": true}` with no session/token).
**Blockers:** none

**Dispatch-In:** `tasks/stage-4-backend-scaffold.md`
**Gate-Out:** `gate-out/stage-4-backend-scaffold.md`
**Merge-Approval:** `merge-approval/stage-4-backend-scaffold.md`

---

### stage-5-auth

**Domain:** Go backend, apps/mobile
**Depends On:** stage-4-backend-scaffold
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Auth implemented, but as phone-OTP (`POST /api/otp/request`, `POST /api/otp/verify`) rather than `POST /v1/auth/register`/`POST /v1/auth/login` per CONTRACTS.md → Auth — the client asked for phone OTP specifically (see stage-12/13); CONTRACTS.md's Auth section should be updated to match if this is the permanent shape
- [x] Bearer token (JWT) issuance + validation middleware, no cookies (SECURITY_RULES.md) — see stage-13-backend-jwt-issuance
- [x] Mobile app: sign-in/verify screens, token storage (zustand persist, not a separate secure flow — explicit client decision), no `apiFetch` wrapper yet (see stage-14-mobile-auth-flow) — only `lib/api/authApi.ts` exists so far, scoped to auth calls only

**Dispatch-In:** `tasks/stage-5-auth.md`
**Gate-Out:** `gate-out/stage-5-auth.md`
**Merge-Approval:** `merge-approval/stage-5-auth.md`

---

### stage-6-mobile-shell

**Domain:** apps/mobile
**Depends On:** stage-1-setup
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Expo Router navigation shell with 4 tabs: Feed, Event, Profile, Chat
- [x] Design system / theming baseline in place
- [x] Placeholder screens render for all 4 tabs

**Done:** Built the mobile shell in `apps/mobile/src`. Structure: `app/` (expo-router routes only, thin) → `screens/` (page composition) → `components/` (ui/, feed/, events/, chat/, profile/, icons/) → `store/` (Zustand global state: `useAuthStore`, `useFeedFilterStore`) → `hooks/` (local `useState` logic: `useComposePost`) → `lib/mockData.ts` (no backend yet, per stage-4 still PLANNING) → `theme/colors.ts` + `global.css` `@theme` tokens (Nextdoor-inspired warm/green palette, confirmed with client). Added deps: `zustand`, `react-native-svg` (icons — no emoji, per CLAUDE.md), `react-native-safe-area-context`, `react-native-web`+`react-dom` (for web-preview verification only). Tab icons are custom inline SVG. All 4 screens use real neighborhood-flavored mock content (not lorem ipsum), per DESIGN_SYSTEM.md.
**Verified:** `pnpm type-check` clean; `expo start --web` booted, drove all 4 tabs + category filter + compose-post with Playwright — screenshots captured, zero console errors.
**Next:** Dispatch stage-4-backend-scaffold (Go backend) so stage-5-auth → stage-7..10 can wire the screens to real data instead of `lib/mockData.ts`.
**Blockers:** none

**Dispatch-In:** `tasks/stage-6-mobile-shell.md`
**Gate-Out:** `gate-out/stage-6-mobile-shell.md`
**Merge-Approval:** `merge-approval/stage-6-mobile-shell.md`

---

### stage-7-feed

**Domain:** Go backend, apps/mobile
**Depends On:** stage-5-auth, stage-6-mobile-shell
**Status:** `PLANNING`

**Acceptance Criteria:**
- [ ] `GET /v1/feed`, `POST /v1/feed` implemented per CONTRACTS.md → Feed
- [ ] Mobile Feed screen: list posts, create post

**Dispatch-In:** `tasks/stage-7-feed.md`
**Gate-Out:** `gate-out/stage-7-feed.md`
**Merge-Approval:** `merge-approval/stage-7-feed.md`

---

### stage-8-event

**Domain:** Go backend, apps/mobile
**Depends On:** stage-5-auth, stage-6-mobile-shell
**Status:** `PLANNING`

**Acceptance Criteria:**
- [ ] `GET /v1/events`, `POST /v1/events`, `POST /v1/events/:id/join` implemented per CONTRACTS.md → Event
- [ ] Mobile Event screen: browse, create, join events/missions

**Dispatch-In:** `tasks/stage-8-event.md`
**Gate-Out:** `gate-out/stage-8-event.md`
**Merge-Approval:** `merge-approval/stage-8-event.md`

---

### stage-9-profile

**Domain:** Go backend, apps/mobile
**Depends On:** stage-5-auth, stage-6-mobile-shell
**Status:** `PLANNING`

**Acceptance Criteria:**
- [ ] `GET /v1/users/me`, `PATCH /v1/users/me` implemented per CONTRACTS.md → Profile
- [ ] Mobile Profile screen: view + edit profile

**Dispatch-In:** `tasks/stage-9-profile.md`
**Gate-Out:** `gate-out/stage-9-profile.md`
**Merge-Approval:** `merge-approval/stage-9-profile.md`

---

### stage-10-chat

**Domain:** Go backend, apps/mobile
**Depends On:** stage-5-auth, stage-6-mobile-shell
**Status:** `PLANNING`

**Acceptance Criteria:**
- [ ] `GET /v1/chats`, `GET /v1/chats/:id/messages`, `POST /v1/chats/:id/messages` implemented per CONTRACTS.md → Chat
- [ ] Mobile Chat screen: conversation list + message thread

**Dispatch-In:** `tasks/stage-10-chat.md`
**Gate-Out:** `gate-out/stage-10-chat.md`
**Merge-Approval:** `merge-approval/stage-10-chat.md`

---

### stage-11-mobile-jobs-sport-clubs

**Domain:** apps/mobile
**Depends On:** stage-6-mobile-shell
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Three new tabs added to the shell: Jobs & Announcements, Sport, My Clubs (screens, cards, mock data — same pattern as stage-6)
- [x] Global product rules surfaced in UI: verified badge next to every author/host/poster, no avatar upload (initials-only, unchanged), private/public profile toggle on Profile
- [x] Local-first data layer for Feed: `lib/db/postsRepo.{native,web}.ts` (react-native-nitro-sqlite on iOS/Android, localStorage on web), `sync_outbox` table, `lib/sync/syncEngine.ts` stub
- [x] Auth/profile state persisted on-device: `useAuthStore` wrapped in zustand `persist()`, backed by `lib/storage/zustandStorage.{native,web}.ts` (MMKV / localStorage)
- [x] Fixed two bugs found in review: `FeedScreen.handlePost` no longer hardcodes category "General"; `useComposePost.submit` now awaits `onSubmit` so the double-submit guard is real

**Done:** Extended the stage-6 tab shell with three more sections and a local-first storage foundation. Platform-specific files (`.native.ts`/`.web.ts`) were used only where iOS/Android and web genuinely need different code — both `react-native-nitro-sqlite` and `react-native-mmkv` are NitroModules with no web build, so each has a `.native.ts` (real implementation), a `.web.ts` (localStorage equivalent, same function shapes), and a bare `.ts` fallback that just re-exports `.native` (Metro always prefers the platform-specific file at runtime; the bare file exists only so `tsc` can resolve the import — a `moduleSuffixes` tsconfig change was tried first and reverted because it broke NativeWind's `className` prop typing project-wide). Everything else stayed a single shared file, per Expo's own platform-file guidance (only split on genuine divergence).

Also fixed a native iOS build break unrelated to this feature but blocking verification: `expo-modules-core` (up to the current latest, 57.0.14) only supports `react-native-worklets` `^0.7.4`–`^0.10.0`, while `react-native-reanimated@4.6.0` requires `0.12.x` exactly — no worklets version satisfies both. Pinned `react-native-worklets` to `0.10.1` and `react-native-reanimated` to `4.5.2` via `pnpm-workspace.yaml` → `overrides` (whose new-pnpm home is the workspace file, not `package.json`'s now-ignored `pnpm.overrides`). Verified with a real `xcodebuild` — `BUILD SUCCEEDED`.

Mid-task, `apps/mobile` was accidentally deleted and a git checkout reverted `pnpm-workspace.yaml`/`DECISIONS.md` along with it; everything in this stage was rebuilt from conversation history and re-verified (`pnpm type-check` clean, `xcodebuild` succeeds) before this commit.

**Verified:** `pnpm type-check` clean across the monorepo (the one pre-existing failure, `apps/api`'s Stripe API-version type error, predates this stage and is unrelated); `xcodebuild` `BUILD SUCCEEDED` on iOS Simulator after a full `expo prebuild` regeneration.
**Next:** Jobs/Sport/Clubs have no backend contract yet — needs its own stage before `+ create` flows are real. stage-7..10 (Feed/Event/Profile/Chat backend wiring) still block on stage-5-auth and the Go backend not existing yet (see stage-4-backend-scaffold, about to be dispatched with Fiber v3 + Bun ORM + Postgres + Redis + a separate WebSocket service).
**Blockers:** none — `apps/mobile/ios/` (CocoaPods-generated Xcode project) is intentionally left untracked, matching how it was before this stage; regenerate via `expo prebuild --platform ios` if missing.

**Dispatch-In:** `tasks/stage-11-mobile-jobs-sport-clubs.md`
**Gate-Out:** `gate-out/stage-11-mobile-jobs-sport-clubs.md`
**Merge-Approval:** `merge-approval/stage-11-mobile-jobs-sport-clubs.md`

---

### stage-12-backend-otp-scaffold

**Domain:** backend/api-go, backend/ws-go
**Depends On:** stage-1-setup
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] `backend/api-go` — Fiber v3 REST API, Bun ORM + Postgres (`internal/db`), Redis client (`internal/redisclient`), config loader (`internal/config`)
- [x] `backend/ws-go` — separate WebSocket service (plain `net/http` + `github.com/coder/websocket`, not Fiber — see Blockers)
- [x] Phone OTP auth built from scratch on top of ThaiBulkSMS's plain SMS send API (not their managed "SMS OTP Ready to Use" product — its API contract wasn't published where it could be checked; building it ourselves keeps the SMS provider swappable): `POST /api/otp/request`, `POST /api/otp/verify`, `GET/POST /api/otp` (ThaiBulkSMS delivery-report webhook, matches the URL already registered in their dashboard for this app)
- [x] `docker-compose.yml` at repo root: postgres, redis, api, ws — reads the root `.env` automatically
- [x] `go build`, `go vet`, `gofmt` clean on both modules (`backend/go.work` ties them together for local tooling)

**Done:** Scaffolded both Go services requested by the client, consolidated under `backend/` (not `apps/`) per explicit request to keep all backend code in one place. `backend/api-go/internal/sms/thaibulksms.go` was built against ThaiBulkSMS's actual developer manual (`API-v2-th.pdf`) — endpoint, auth scheme, and field names confirmed from the PDF, not guessed: `POST https://api-v2.thaibulksms.com/sms`, HTTP Basic Auth (API Key/Secret as username/password), form body (`msisdn`, `message`, `sender`), JSON success/error response shapes. `backend/api-go/internal/otp/otp.go` owns the OTP lifecycle (6-digit code, Redis-backed with 5 min TTL, 60s request cooldown, 5-attempt verify limit) independently of the SMS transport, so swapping providers later (THSMS, Thaibulksms's own managed OTP product, etc.) only touches `internal/sms`.

`backend/ws-go` could not use `gofiber/contrib/websocket` — that package only supports Fiber v2 (pulls in `fiber/v2` as a dependency), and Fiber v3 core ships no websocket middleware yet. Built on plain `net/http` + `github.com/coder/websocket` instead; `internal/hub` is an in-memory, single-instance room broadcaster (chat-oriented, for stage-10-chat later).

**Verified:** `go build ./api-go/... ./ws-go/...`, `go vet`, and `gofmt -l` all clean from `backend/` (workspace mode — bare `./...` doesn't work at the go.work root itself, needs the per-module pattern). `docker compose config` validates the full stack and env substitution. **NOT verified:** `docker compose up` — OrbStack's daemon wasn't running (`docker socket not found`) when this was built, so the containers have never actually been started. No `go test` exists yet either.

**Next:** Start OrbStack and run `docker compose up -d --build` to confirm all 4 containers actually come up healthy — do this before relying on any of this being deployable. Then: CORS middleware (mobile app can't call this yet), real Bearer/JWT issuance on OTP verify success (currently just returns `{"verified": true}`), a real migration tool, first tests, `golangci-lint`. See `backend/TODO.md` for the full checklist.
**Blockers:** OrbStack daemon not running in the environment this was built in — `docker compose up` is untested. `gofiber/contrib/websocket` has no Fiber v3 release; revisit `backend/ws-go`'s transport choice if that changes.

**Dispatch-In:** `tasks/stage-12-backend-otp-scaffold.md`
**Gate-Out:** `gate-out/stage-12-backend-otp-scaffold.md`
**Merge-Approval:** `merge-approval/stage-12-backend-otp-scaffold.md`

---

### stage-13-backend-jwt-issuance

**Domain:** backend/api-go
**Depends On:** stage-12-backend-otp-scaffold
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] OTP verify success issues a real Bearer/JWT token (previously just returned `{"verified": true}`)
- [x] `internal/authtoken` — minimal HS256 JWT issue/verify via `golang-jwt/jwt/v5`
- [x] `internal/db/users.go` — upserts the user row (Postgres, via Bun) on successful verify
- [x] `RequireAuth` middleware + `GET /api/me` as a working protected-route example
- [x] OrbStack confirmed running; full stack (`docker compose up -d --build`) verified live, not just `docker compose config`

**Done:** Evaluated `github.com/Authula/authula` (client-suggested) by cloning the actual repo — it's a real Go framework on Fiber v3.3.0 (compatible with our v3.5.0) with a genuine plugin architecture, but its `jwt` plugin requires adopting its `session` plugin, JWKS key rotation with encrypted key storage, and its own migration set — not a drop-in single function call. It also has no phone/SMS OTP plugin at all (only TOTP authenticator-app 2FA), so it wouldn't have replaced stage-12's OTP work anyway. Client confirmed: use Authula for JWT/session scope only if simple, else write it ourselves — given the real integration cost, wrote a minimal `internal/authtoken` instead (HS256, no rotation, ~60 lines). Revisit Authula (or `internal/authtoken` → refresh tokens) if rotation/revocation becomes a real requirement.

Fixed a routing bug caught during live testing: `api.Get("/me", handlers.Me, handlers.RequireAuth(...))` runs handlers in argument order, so `Me` was executing *before* `RequireAuth` — reversed to `RequireAuth` then `Me`.

**Verified live** (OrbStack was running this time): `docker compose up -d --build` → all 4 containers up, postgres/redis healthy. `GET /api/me` unauthenticated → 401. Seeded a code directly in Redis and called `/api/otp/verify` → user row created in Postgres, real JWT returned; that JWT against `GET /api/me` → correct claims back. Reusing the same code → 404 (single-use confirmed). Wrong code → 401. A real OTP *request* against a fake test number correctly failed at ThaiBulkSMS and rolled back the Redis code (confirms stage-12's rollback-on-send-failure logic) — real SMS sends themselves still untested pending an approved `SMS_SENDER` name.

**Next:** CORS middleware, real migration tool, first tests, `golangci-lint`, daily per-phone OTP request cap, a real approved sender name to test actual SMS delivery. See `backend/TODO.md`.
**Blockers:** none

**Dispatch-In:** `tasks/stage-13-backend-jwt-issuance.md`
**Gate-Out:** `gate-out/stage-13-backend-jwt-issuance.md`
**Merge-Approval:** `merge-approval/stage-13-backend-jwt-issuance.md`

---

### stage-14-mobile-auth-flow

**Domain:** apps/mobile, backend/api-go
**Depends On:** stage-11-mobile-jobs-sport-clubs, stage-13-backend-jwt-issuance
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] `(auth)/signin.tsx` (phone entry) → `(auth)/verify.tsx` (6-digit code) → real JWT from `backend/api-go`; single phone-OTP flow covers both signup and signin (`UpsertVerifiedUser` on the backend handles either case identically)
- [x] `lib/api/authApi.ts` + `lib/api/config.ts` — real HTTP calls to the backend, `EXPO_PUBLIC_API_URL` overridable for Android emulator / physical device
- [x] Session persisted via `useAuthStore` + zustand `persist` (MMKV/localStorage) — explicit client decision to keep the token in the same persisted store as the rest of auth state, not a separate secure-keychain flow
- [x] Root `_layout.tsx` `AuthGate` redirects signed-out users to `(auth)/signin` and signed-in users away from it; `app/index.tsx` added as the explicit entry for `/` (previously ambiguous once a second route group existed)
- [x] `backend/api-go/internal/otp/otp.go` now logs the real ThaiBulkSMS error on send failure (it silently swallowed it before — the client-facing error was always the generic "failed to send verification code")

**Done:** Built the mobile side of stage-13's OTP+JWT backend. Also used this stage to find and fix the actual real-world blockers for SMS delivery: the client's `SMS_SENDER` env value (`Kemago`) was never an approved sender name, which only surfaced once the missing error-logging (above) was added — the real ThaiBulkSMS response was `ERROR_SENDER (code 110)`. Client found the approved sender name ("Demo") in their dashboard; updating `SMS_SENDER` and retrying immediately produced a *different*, expected error: `ERROR_INSUFFICIENT_CREDIT (code 116)` — confirming the sender fix worked and the only remaining blocker to a real SMS being delivered is the account's SMS credit balance (0 at the time of this stage).

**Verified:** `pnpm type-check` clean. `npx expo export --platform web` succeeded — all 20 routes bundled with no runtime import errors, including the new `/`, `/signin`, `/verify` routes (this is stronger than type-check alone: it catches bundler/runtime issues tsc can't see). **Not yet verified:** never run in an actual Expo dev session / simulator — only the static export was checked. A live OTP request against the client's real phone number correctly reached ThaiBulkSMS twice (proving the sender-name fix), but no SMS has actually been delivered yet — blocked on account credit, not on this stage's code.
**Next:** Top up ThaiBulkSMS credit, then do one real end-to-end sign-in (real SMS received → code entered → signed in) on an actual device/simulator, not just the web export. No sign-out UI exists yet. See `apps/mobile/TODO.md` → Auth section for the rest.
**Blockers:** ThaiBulkSMS account has 0 credit — real SMS delivery cannot be confirmed until it's topped up.

**Dispatch-In:** `tasks/stage-14-mobile-auth-flow.md`
**Gate-Out:** `gate-out/stage-14-mobile-auth-flow.md`
**Merge-Approval:** `merge-approval/stage-14-mobile-auth-flow.md`

---

### stage-15-otp-provider-abstraction

**Domain:** backend/api-go
**Depends On:** stage-14-mobile-auth-flow
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] `otp.Provider` interface introduced — `Service` now owns only cooldown/attempt-limiting/session-storage; a provider owns code generation/delivery/checking. Swapping providers is a one-line change in `main.go`; the HTTP contract (`identifier`/`code`) doesn't change.
- [x] Three providers built: `SelfGenProvider` (our own Redis codes over any `sms.Sender`), `SMSMKTOTPProvider` (SMSMKT's managed OTP product), `EmailOTPProvider` (our own codes via Resend email) — see `backend/TODO.md` for which is active
- [x] `internal/sms/smsmkt.go` — SMSMKT's plain send-message API, confirmed live (format validated via real requests, `code: "100"` = validation error, `"000"` = success)
- [x] `internal/email/resend.go` — Resend REST API client, same provider `packages/email` already uses elsewhere in the repo
- [x] `db.User.Phone` renamed to `db.User.Identifier` — the column now holds whatever the active provider verified (email today, phone number when that's active)
- [x] Request/verify body field renamed `phone` → `identifier` throughout the backend

**Done:** Client asked to evaluate two more SMS/OTP vendors (Godysms, SMSMKT) after ThaiBulkSMS turned out to have 0 account credit. Godysms's actual send endpoint 404'd and its dashboard didn't expose a docs page for the plain-SMS API in time; SMSMKT did, and had real credit (confirmed via a live `get-credit` call, 10 credits). SMSMKT turned out to offer both a plain SMS API (`send-message`, needs its own NBTC-approved sender name — none exists on this account yet) and a managed OTP product (`otp-send`/`otp-validate`, tied to a `project_key` from a pre-approved OTP Project the client already had). Client chose the managed OTP path for speed — this is a deliberate, acknowledged exception to "keep OTP logic ours," made possible without giving up provider-swappability because it fits behind the same `otp.Provider` interface as everything else.

**A real SMS was sent to the client's own phone number and confirmed received** — the first fully-verified real OTP delivery this project has had (ThaiBulkSMS never got past 0 credit; SMSMKT's own send-message path never got an approved sender). Hit and fixed one real bug along the way: SMSMKT's `otp-send` response has `ref_code` typed as an int in their docs but returns as a string live — decode failed until the field was retyped to `json.RawMessage` (it's unused, so no need to actually parse it correctly, just not choke on it).

Immediately after confirming SMS delivery, the client asked to switch the *active* provider again — to email via Resend, to avoid per-message SMS cost while volume is low, with phone OTP to come back later. This is what motivated introducing the `Provider` abstraction now rather than continuing to hardcode "SMS-shaped" logic into `otp.Service`: `EmailOTPProvider` reuses the exact same code-generation logic as `SelfGenProvider`, and switching back to any of the three built providers is one line in `main.go`.

**Verified:** `go build`/`go vet`/`gofmt` clean on `backend/api-go`. Container starts cleanly against the live stack with `RESEND_API_KEY` configured (previous env-var misconfigurations for other providers crash-looped the container immediately on missing required config, so a clean start is a real signal here). **Not yet verified:** no real email has been sent yet — `POST /api/otp/request` against the email provider hasn't been called live, only the SMS-based providers before it were confirmed end-to-end.
**Next:** Send a real test OTP email once the client provides an address to test with. **`apps/mobile` was not updated in this stage and is now out of sync** — it still sends `{"phone": ...}" and only accepts phone-number input; the backend now expects `{"identifier": ...}` validated as an email address. Reconcile before the mobile sign-in flow is tried again live. See `backend/TODO.md` and `apps/mobile/TODO.md` for the full gap list.
**Blockers:** none for the backend; mobile/backend contract mismatch noted above blocks a live mobile sign-in until fixed.

**Dispatch-In:** `tasks/stage-15-otp-provider-abstraction.md`
**Gate-Out:** `gate-out/stage-15-otp-provider-abstraction.md`
**Merge-Approval:** `merge-approval/stage-15-otp-provider-abstraction.md`

---

### stage-16-auth-migration-to-better-auth

**Domain:** backend/better-auth (new), apps/mobile, backend/api-go (removed)
**Depends On:** stage-15-otp-provider-abstraction
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Mobile login switched from phone to email input, wired to a real OTP send/verify flow
- [x] Session persists on-device (zustand + MMKV, unchanged) and slides forward on continued use — no re-login required within a rolling 30-day window
- [x] Post-login "complete your profile" step (name field) gates first-time users before `(tabs)`, backed by a real `profileComplete` flag
- [x] `backend/api-go`'s OTP/JWT/profile stack replaced by `backend/better-auth` (Bun + Better Auth + Drizzle + Postgres), per direct client decision to let Better Auth's own plugins own all auth CRUD
- [x] Log out button (ProfileScreen) invalidates the server session and clears persisted client state — verified both halves independently

**Done:** This stage covers a full session of interactive work, not a single dispatched task — summarized here for continuity.

Started as a scoped fix: the mobile app still showed phone-number sign-in (`SignInScreen`/`VerifyOtpScreen`) while stage-15 had already switched the backend to email OTP, and `authApi.ts` still POSTed `{"phone": ...}` against a backend expecting `{"identifier": ...}` — real login was silently broken. Fixed that, added a 30-day rolling session (`POST /api/auth/refresh` on `backend/api-go`) and a post-login profile-completion step (`name`/`neighborhood`, `profile_complete` flag on `db.User`), all verified live against the real Postgres/Redis containers with 27 new Go tests.

Mid-session, client asked to evaluate `github.com/Authula/authula` again (previously rejected in stage-13) with the constraint "we only do GET, Authula owns CRUD." Cloned the real repo and found it fits the stack well (Fiber v3, Bun ORM, Postgres) but has no email-OTP-code plugin — only `magic-link` (email link) and `totp` (authenticator 2FA). Reported this gap; client redirected to **Better Auth's own `emailOTP` plugin** instead (`packages/email` already existed, `better-auth` was already a dependency in `packages/auth` for the other TS backend, client knew this) — a new standalone service `backend/better-auth` (Bun runtime, targeting Railway deploy), using Drizzle (not the built-in Kysely adapter, not Prisma — client explicitly asked to match `packages/auth`'s existing ORM choice) against a new Postgres schema (`user`/`session`/`account`/`verification`, D1/SQLite schema in `packages/db` can't be reused outside Cloudflare Workers).

`backend/api-go` was then deleted entirely at the client's direction, after live-testing the replacement end-to-end first. This session's uncommitted Go work (the refresh/profile-completion feature above) is preserved in a git stash (`backend/api-go: this session's OTP/refresh/profile work...`), not on disk — recoverable via `git stash list` if ever needed, but superseded by `backend/better-auth`.

Two real bugs found and fixed post-migration:
1. Postgres volume still had the pre-stage-15 `phone` column — `db.Migrate`'s `CREATE TABLE IF NOT EXISTS` never touches existing tables. Fixed with a one-time conditional `ALTER TABLE ... RENAME COLUMN` (this was on `backend/api-go`, now moot since that service is gone, but the same class of bug is worth watching for in `backend/better-auth`'s Drizzle migrations too).
2. React Native's `fetch` sends a literal `Origin: null` header, which Better Auth's origin-check middleware treats as `MISSING_OR_NULL_ORIGIN` and rejects with 403 on endpoints it force-validates (e.g. `update-user`). Fixed via `advanced.disableCSRFCheck: true` — this service is Bearer-only with no cookies anywhere, so there's no real CSRF surface to protect.

Also fixed the Resend sandbox restriction blocking real email delivery (`EMAIL_FROM` was still `onboarding@resend.dev`, which only delivers to the account owner's own address) by switching to `dikapay.app`, a domain already verified on the same Resend account, as a demo stand-in until Kemago has its own verified domain.

**Verified live** (OrbStack running, real Postgres/Redis, real Resend sends): full OTP request→verify→session→update-profile→sign-out loop tested via curl matching the mobile client's exact request shapes, at each stage of the pivot (raw `pg`, then again after converting to Drizzle). A real email was confirmed received by the client on `wansing05@gmail.com`. `tsc --noEmit` clean on `apps/mobile` and `backend/better-auth`. `docker compose config` validates with `backend/api-go`'s `api` service removed.

**Next:**
- `backend/better-auth` still needs its actual Railway deployment (service is Railway-ready — reads `PORT`/`DATABASE_URL` from env, has a Dockerfile with repo-root build context — but was only run locally via `bun src/server.ts` in this session)
- No password/session revocation UI beyond the one Log out button; no "log out of all devices"
- `EMAIL_FROM` is still the demo `dikapay.app` domain — swap for Kemago's own verified domain before real users see it
- The stray `backend/api-go/internal/authtoken` reasoning ("no refresh tokens/rotation, revisit Authula if that becomes a real requirement") is now moot — `backend/better-auth`'s session plugin (`updateAge`) covers the same rolling-session need natively

**Blockers:** none

**Dispatch-In:** none — direct interactive session with the client, not a formal Conductor-dispatched task
**Gate-Out:** n/a
**Merge-Approval:** n/a

---

### stage-17-mobile-ios-gitignore

**Domain:** apps/mobile
**Depends On:** none
**Status:** `COMPLETE`

**Done:** `apps/mobile/ios/` (the `expo prebuild`-generated Xcode project, including a 1.2GB `Pods/` directory) was showing as 19 untracked files in `git status` despite never having been intentionally tracked (see stage-11's Blockers note — it was already meant to be untracked, just not codified). Added `ios/` to `apps/mobile/.gitignore` so it stops showing up as pending changes; confirmed no custom native code exists in it (`AppDelegate.swift`/`Podfile` are stock boilerplate) before ignoring the whole directory rather than cherry-picking `Pods/`/`build/`/`xcuserdata/`.
**Next:** none — regenerate via `expo prebuild --platform ios` whenever the native project is needed locally.
**Blockers:** none

**Dispatch-In:** none — direct interactive session with the client
**Gate-Out:** n/a
**Merge-Approval:** n/a

---

### stage-18-rename-project-kemago

**Domain:** repo-wide
**Depends On:** none
**Status:** `COMPLETE`

**Done:** Client asked to rename the project from Coarea to Kemago, confirmed full scope (brand/UI text, `agentic/` historical docs, `@gover-agent/*` package namespace, GitHub repo). Replaced `Coarea`→`Kemago` and `coarea`→`kemago` across every tracked file that mentioned it (README, all of `agentic/`, mobile UI strings, storage/DB key prefixes, OTP email copy, `docker-compose.yml`, `.env.example` files, `backend/ws-go`'s Go module path + its one internal import). Renamed the pnpm workspace scope `@gover-agent/*` → `@kemago/*` across every `package.json` (root `name` field included) and every cross-package import (including the mechanical import-path update inside the two protected files, `forum.route.ts`/`roadmap.route.ts` — string-only, no logic touched). Left template-only "GoverAgent"/"gover-agent" branding alone where it's demo copy in the inactive `apps/web`/`apps/api` track (marketing labels, a placeholder email domain, an Anthropic sandbox-env display name) — not part of the package namespace, out of scope for this rename.

GitHub side: `gh repo view` showed the repo had already been renamed to `kemago` on GitHub's side (redirect from the old `coarea` slug); updated the local `origin` remote URL to match and confirmed `git fetch` works.

**Verified:** `go build ./...` clean on `backend/ws-go` after the module-path rename; `pnpm install` (re-links workspace symlinks under the new scope) then `pnpm --filter @kemago/mobile type-check` and `pnpm --filter @kemago/better-auth-service type-check` both clean.
**Next:** Actual local `.env`/`backend/better-auth/.env` files (gitignored, untouched by this rename) still hold the old `coarea` Postgres user/db name — renaming those means recreating the Postgres container/volume (`docker-compose.yml`'s volume is now named `kemago_postgres_data`, so the next `docker compose up` creates a fresh empty volume rather than reusing the old `coarea_postgres_data` one with existing data). Client should confirm before that happens. `apps/mobile/app.json` (`name`/`slug: "mobile"`, `scheme: "acme"`, bundle id `com.wansing05.mobile`) was never actually named "coarea" and was left untouched — flag if the client wants it renamed to Kemago too.
**Blockers:** none

**Dispatch-In:** none — direct interactive session with the client
**Gate-Out:** n/a
**Merge-Approval:** n/a

---

### stage-19-roadmap-backlog-capture

**Domain:** agentic/ROADMAP.md
**Depends On:** none
**Status:** `COMPLETE`

**Done:** Client dropped a feature wishlist into a root-level `goal.md` (untracked scratch file, not part of this commit) and asked for each section to be captured into the roadmap. Added M-008 through M-021 to ROADMAP.md's Milestone Backlog, translated into plain-language, non-technical descriptions per CLAUDE.md's roadmap language rules: comments/likes, a running-story/reel feature with per-post visibility (friends/only-me/public), private/public profile toggle, verified-identity gating on local-activity posts, clubs (verified creator, a leader role that can be reassigned), poll-style posts, automated bad-language screening on posts/comments, block user, an overall community reputation score, and five explicitly-future items (shop, restaurant ranking, food delivery, official in-app shop payments, automatic spending tracking). Everything is `PLANNING` status, appended after the existing M-001–M-007 milestones — nothing reordered or marked done. Updated "Next Steps" to note this backlog is queued behind current work, and "Project Scope" → Out of Scope to list the five future-phase items explicitly.
**Next:** None of these are scoped/dispatched as implementation stages yet — each needs its own CONTRACTS.md entry and stage dispatch (with client sign-off on acceptance criteria) before a Worker starts building it. Event (goal.md item 3.3) already exists as M-005 — not duplicated.
**Blockers:** none

**Dispatch-In:** none — direct interactive session with the client
**Gate-Out:** n/a
**Merge-Approval:** n/a

---

### stage-20-post-comment-system

**Domain:** backend/better-auth, apps/mobile
**Depends On:** stage-19-roadmap-backlog-capture
**Status:** `SUPERSEDED by stage-22` — client corrected this stage's placement (post/comment data on `backend/better-auth`, TypeScript) as soon as they saw it, per DECISIONS.md → "Backend Domain Ownership — TypeScript Is Auth-Only". Everything below happened and was verified working as described, but the `post`/`comment` Drizzle tables, `src/routes/posts.ts`, and the `server.ts` wiring described here were removed in stage-22 and rebuilt in Go on `backend/ws-go`. Left as-is (append-only) for the historical record; do not treat this stage's "Domain"/implementation as current.

**Acceptance Criteria:**
- [x] Real `POST`/`GET /api/posts` and `GET`/`POST /api/posts/:id/comments` on `backend/better-auth` (see CONTRACTS.md → Feed/Comment)
- [x] Mobile Feed screen reads real posts from the API (falls back to the local-first cache if the API is unreachable) and posts through the real API when signed in
- [x] Tapping a post opens a new detail screen (`/post/[id]`) showing the post and its replies, with a reply composer
- [ ] Likes — not built this round, `likeCount` exists in the schema/response but nothing writes to it yet
- [ ] AI pre-publish moderation — intentionally not built; blocked on the prohibited-content list per `coarea_product_rules` memory

**Done:** `backend/better-auth` was the only live backend (auth-only until now); extended it rather than standing up a separate service, per the established "keep backend in one place" pattern. Added `post`/`comment` Drizzle tables (`src/db/schema.ts`), a hand-rolled router (`src/routes/posts.ts`) that `server.ts` checks before falling through to Better Auth's own handler, and Bearer auth on writes via `auth.api.getSession(...)` (same mechanism Better Auth's own endpoints already use). `authorVerified` in every response is read live from `user.emailVerified` — there's no real identity-verification system yet (open TODO in memory), so this is an honest interim proxy using a field that already exists, not a stand-in for the eventual KYC feature. `replyCount` is computed via a `GROUP BY` count join rather than a stored counter, so it can't drift from the actual comment rows.

Mobile: added `lib/api/postsApi.ts`, wired `FeedScreen` to fetch/post through it (offline fallback preserved via the existing `postsRepo.*`/local cache), and built the first inner-page screen in the app (`screens/post/PostDetailScreen.tsx` + `app/post/[id].tsx`), which also required adding the project's first `BackButton` component (`components/ui/BackButton.tsx`) per CLAUDE.md's Navigation Rules — no earlier screen needed one since everything before this was a root tab. `PostCard` is now pressable (`Card`'s existing `onPress` prop) and navigates there.

**Verified:** `pnpm --filter @kemago/better-auth-service exec tsc --noEmit` and `pnpm --filter @kemago/mobile type-check` both clean. `npx expo export --platform web` succeeded with `/post/[id]` present in the route list. Pushed the new tables to the live dev Postgres (`drizzle-kit push`, additive only — no existing tables touched) and live-tested against it: unauthenticated `POST /api/posts` → 401, `GET` on a missing post id → 404, Better Auth's own `/api/auth/get-session` still passes through unaffected, `OPTIONS /api/posts` → 204. Seeded one real post+comment row directly via SQL (attributed to the developer's own already-verified account) and confirmed `GET /api/posts`, `GET /api/posts/:id`, and `GET /api/posts/:id/comments` all return the correct shape with the right `replyCount`, then deleted the test rows (comment cascade-deleted automatically). **Not yet live-tested:** the authenticated write path (`POST /api/posts` / `POST /api/posts/:id/comments` with a real Bearer token) — that needs a live OTP round-trip (a real email) which wasn't triggered this session; the code path reuses the identical `auth.api.getSession` call already proven working by the unauthenticated-401 test and by Better Auth's own passing endpoints, but treat it as logically-verified, not live-confirmed, until someone actually posts from the app.
**Next:** Do one real signed-in post + reply from the mobile app (or a curl with a real token) to close the gap above. Then: likes (write path), pagination/cursor, and the neighborhood/location model that Feed's `area` field and `PostCard`'s neighborhood text are currently faking with a "Nearby" placeholder (see `FeedScreen.tsx` → `toLocalPost`).
**Blockers:** none

**Dispatch-In:** none — direct interactive session with the client
**Gate-Out:** n/a
**Merge-Approval:** n/a

---

### stage-21-email-password-auth

**Domain:** backend/better-auth
**Depends On:** stage-20-post-comment-system
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] `POST /api/auth/sign-up/email` and `POST /api/auth/sign-in/email` work, returning the same `{ token, user }` shape as the existing email-OTP sign-in
- [x] Existing email-OTP sign-in unaffected

**Done:** Enabled Better Auth's built-in `emailAndPassword` (core config, not a plugin) alongside the existing `emailOTP` plugin — both sign-in methods coexist on the same `user` row, Better Auth just adds a second `account` row (`provider_id: "credential"`) holding the password hash. Hit and fixed a real schema-drift bug along the way: sign-up threw `BetterAuthError: The field "issuer" does not exist in the "account" Drizzle schema` — this Better Auth version's core account-creation path (used by every provider, not just OAuth) now writes an `issuer` column that our hand-written Drizzle mirror (`src/db/schema.ts`) never had. Added a nullable `issuer` text column and pushed it live (`drizzle-kit push`, additive only).

**Verified live:** full lifecycle against the real dev Postgres — sign-up (creates user + account), sign-in (issues a fresh token), `get-session` with that token, sign-out, then `get-session` again confirming the session is actually invalidated (returns `null`). Used a throwaway `agentic-test@example.com` account, deleted afterward. `tsc --noEmit` clean.
**Next:** None from this stage specifically — see stage-22, which used this real password-issued token to close a different stage's open gap.
**Blockers:** none

**Dispatch-In:** none — direct interactive session with the client
**Gate-Out:** n/a
**Merge-Approval:** n/a

---

### stage-22-go-feed-domain

**Domain:** backend/ws-go, backend/better-auth, apps/mobile
**Depends On:** stage-21-email-password-auth
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] `post`/`comment` tables and their REST API removed from `backend/better-auth` entirely — that service is auth-only now, per the new DECISIONS.md entry
- [x] `rooms`, `posts`, `comments`, `likes` tables + REST API built in Go on `backend/ws-go`, properly relational (`posts.room_id → rooms`, `comments.post_id → posts`, `likes` a `(post_id, user_id)` composite-PK join table) — see CONTRACTS.md → Room/Feed/Comment/Like
- [x] `backend/ws-go` reads (never writes) the auth-owned `"user"`/`session` tables to verify Bearer tokens and resolve author identity — same physical Postgres database, cross-service FK
- [x] `apps/mobile` re-pointed at the new Go endpoints; `docker-compose.yml`'s `ws` service wired with `DATABASE_URL`

**Done:** Client caught stage-20 putting domain data on the TypeScript auth service and corrected it immediately (see DECISIONS.md → "Backend Domain Ownership — TypeScript Is Auth-Only", and the superseded note on stage-20 above) — every domain except auth is Go from here on, and it lives in `backend/ws-go` rather than a new separate service (client's explicit call: "รวม go service ไว้ที่เดียวกัน ไม่แยก" — combine into one Go service, don't split, for simpler deploy). Reverted `backend/better-auth`'s `post`/`comment` schema, router, and `server.ts` wiring back out; dropped the two tables from Postgres.

Built the feed domain in Go using [Bun](https://bun.uptrace.dev/) (the Go ORM, unrelated to the JS Bun runtime `backend/better-auth` uses) — the ORM this project's Tech Stack decision already named, even though the original `backend/api-go` never got far enough to actually use it before being replaced. New packages: `internal/db` (connection + bootstrap `CREATE TABLE IF NOT EXISTS` migrations + Bun models), `internal/authcheck` (reads `session`/`user` to verify a Bearer token — the Go-side equivalent of `auth.api.getSession`), `internal/feed` (the actual HTTP handlers, using Go 1.22+'s `http.ServeMux` method+`{wildcard}` routing instead of a router dependency). `main.go` now requires `DATABASE_URL`, runs migrations on boot, and wraps the mux in a small CORS middleware (wildcard origin — Bearer-only, no cookies, so no credential-leak surface, same reasoning as `better-auth`'s `disableCSRFCheck`).

Hit and fixed a real driver-compatibility bug: `uptrace/bun/driver/pgdriver` doesn't bind parameters correctly when a raw SQL string with literal `$1` placeholders is run through the embedded `*sql.DB`'s own `QueryContext`/`QueryRowContext` — Postgres rejects it with `there is no parameter $1` (SQLSTATE 42P02, sent via the simple protocol instead of extended/bound). Fixed by routing every raw query through `db.NewRaw(query, args...).Scan(ctx, &dest)` (bun's own formatter, `?` placeholders) instead — the pattern `internal/authcheck` already used successfully. Also added `writeInternalError` (logs the real Go error server-side before responding with a generic message) after this bug cost real debugging time with nothing logged anywhere.

A near-miss during this stage: renaming `docker-compose.yml`'s named Postgres volume from `coarea_postgres_data` to `kemago_postgres_data` (done back in stage-18's rename, but never actually applied until `docker compose up` ran again here) caused Compose to recreate the postgres container on a **new, empty volume** — orphaning the real dev data (the developer's real user/session rows) rather than migrating it. Caught immediately (`docker exec ... psql -c '\dt'` on the freshly "up"'d container showed zero tables), confirmed the old volume (`coarea_coarea_postgres_data`) still existed untouched with the real data, and reverted the volume name back before anything was written to the new one. No data was actually lost, but this is exactly the risk flagged and predicted in stage-18's own "Next" note — a live reminder that a compose volume rename is not a no-op on an environment with real data in it.

Mobile: `lib/api/config.ts`'s `API_BASE_URL` (previously stale, defaulted to port 3000 for the long-deleted `backend/api-go`) now points at `backend/ws-go`'s actual port 3001; `lib/api/postsApi.ts` switched from `AUTH_BASE_URL` to `API_BASE_URL`. No payload changes needed — `roomId` is optional on `createPost` and the Go side defaults it to `"general"` server-side.

**Verified live** (real dev Postgres + Docker): full read path (rooms/posts/single post/comments, 404s on missing posts, 401 on unauthenticated create, 204 on OPTIONS preflight) tested via curl after fixing the pgdriver bug. Then a **full real authenticated round-trip**: signed up a real email+password account via stage-21's new endpoint, used that real Bearer token to create a post, add a comment, like it, unlike it, and confirmed `likeCount`/`replyCount` updated correctly at each step (computed via `count(*)` joins, not stored counters) — the first time this project's Feed write path has been exercised with a real token rather than seeded SQL. Signed out and confirmed the session was actually invalidated. `go build`/`go vet`/`gofmt -l` clean on `backend/ws-go`; `tsc --noEmit` clean on `backend/better-auth` (post-revert) and `apps/mobile` (post-repoint). All test data (test user, room, post, comment, like) cleaned up afterward.
**Next:** No pagination/cursor on `GET /api/posts` yet. `backend/ws-go`'s bootstrap migration (`CREATE TABLE IF NOT EXISTS`) is the same "not a real migration tool" gap already flagged back in stage-4/12 — still open. Mobile has no room-selection UI (everything posts to the auto-created "general" room) and no like-button UI yet (the endpoint exists, nothing calls it from a screen).
**Blockers:** none

**Dispatch-In:** none — direct interactive session with the client
**Gate-Out:** n/a
**Merge-Approval:** n/a

---

### stage-23-rename-ws-go-to-api-go

**Domain:** backend/api-go (formerly ws-go), apps/mobile
**Depends On:** stage-22-go-feed-domain
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] `backend/ws-go` renamed to `backend/api-go` — folder, Go module path, every internal import, `go.work`, `docker-compose.yml` build context, Dockerfile binary name, log lines, comments
- [x] Everything that pointed at the old name (mobile's `API_BASE_URL` comment, `.env.example`, `.dockerignore`, `backend/TODO.md`) updated to match
- [x] Builds and runs identically post-rename — this was a pure rename, no behavior change

**Done:** Client asked for the "ws-go" name to go away now that the service does far more than websockets (rooms/posts/comments/likes REST API, per stage-22). Picked `api-go` — the name of the *original* Go backend deleted in stage-16, which fits again now that this folder is genuinely "the Go API for everything except auth." Not the same code as that original service (that one had its own OTP/JWT stack, Fiber v3, Redis — all gone); just the same name, reused because it's accurate again. `git mv backend/ws-go backend/api-go` (untracked new files from stage-22 — `internal/db`, `internal/authcheck`, `internal/feed` — moved along with it since it's a real filesystem move, not a git-tracked-only rename), then fixed the module path (`go.mod`) and every internal import (`main.go`, `feed.go`) via `sed`, `backend/go.work`'s `use` block, `docker-compose.yml`'s `build.context`, and the Dockerfile's binary name/CMD. Left the docker-compose *service key* (`ws:`), container name, and `WS_PORT` env var name alone — the client asked about the folder specifically, and renaming those too would ripple into `.env`/`.env.example`/README beyond what was asked.

Also cleaned up stale cross-references while touching these files anyway: `.env.example` had `DATABASE_URL` grouped under a "`# backend/api-go`" comment that actually meant the *original*, deleted service, while the *really* Postgres-consuming one (formerly ws-go) was two lines below unlabeled — regrouped and annotated correctly. `backend/TODO.md`'s `## ws-go` section renamed and expanded with stage-22's feed-domain checklist items, with a note distinguishing the old and new `api-go` from each other. `DECISIONS.md`'s "Backend Domain Ownership" entry appended with a note (not rewritten — that entry is a historical decision record) pointing at this rename, and fixed two `stage-21` references in it that should have said `stage-22` (a numbering mistake from when that entry was first drafted, caught while re-reading it here). `CONTRACTS.md` (a living reference doc, not a stage-by-stage log) had its Feed/Comment/Room/Like module descriptions updated to say `backend/api-go` directly, since those describe current reality rather than history.

**Verified:** `go build ./...`, `go vet ./...`, `gofmt -l .` all clean from the new `backend/api-go/` path. `docker compose up -d --build ws` rebuilt and started successfully from the new `./backend/api-go` context; `GET /health`, `GET /api/rooms`, `GET /api/posts` all responded correctly post-rename (byte-identical to pre-rename behavior, as expected for a pure rename). `pnpm --filter @kemago/mobile type-check` clean after the mobile comment updates.
**Next:** None from this stage. The docker-compose service key (`ws`), container name (`coarea-ws-1`), and `WS_PORT` env var still say "ws" — revisit only if the client asks for that too.
**Blockers:** none

**Correction:** the commit that first landed this stage (and stage-21/22) missed staging `go.mod`/`go.sum`/`main.go`/`hub.go`/`Dockerfile`'s already-tested working-tree fixes — those five files went in with their *pre-rename* content (`go.mod` still said `backend/ws-go` while `internal/feed/feed.go` correctly imported `backend/api-go`), so that commit did not actually build. Caught immediately via `git stash` + `go build` against the committed tree (not the working tree, which was always correct) before doing anything else with it. Fixed in a follow-up commit — a lesson for next time: after a multi-file `git mv` + follow-up edits, verify the build against `git stash`'s committed state, not just the working tree, before trusting a commit.

**Dispatch-In:** none — direct interactive session with the client
**Gate-Out:** n/a
**Merge-Approval:** n/a

---

### stage-24-clubs-polls-blocks-privacy

**Domain:** backend/api-go, backend/better-auth, apps/mobile
**Depends On:** stage-23-rename-ws-go-to-api-go
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Clubs: create/join/leave, leader hand-off, backed by real `clubs`/`club_members` tables (CONTRACTS.md → Club)
- [x] Poll-style posts: question + options + one-vote-per-user (upsertable), backed by `polls`/`poll_options`/`poll_votes` (CONTRACTS.md → Poll)
- [x] Block user: block/unblock/list, and blocked users' posts are actually filtered out of `GET /api/posts` (CONTRACTS.md → Block)
- [x] Private/public profile toggle is real (server-persisted `user.profile_public`), replacing the old client-only mock state

**Done:** Four goal.md items dispatched to four parallel subagents, each in its own isolated git worktree, to build independently since the client asked for "หลายๆ agent แบ่งงานกันทำ" (multiple agents dividing the work). Each agent was scoped to its own new files (own Go package, own mobile API client/screens) and explicitly told not to touch shared integration points (`main.go`, `feed.go`, `PostCard.tsx`, `FeedScreen.tsx`, `agentic/` docs) — those were reserved for a single integration pass afterward to avoid four agents editing the same files concurrently.

**Two real coordination problems surfaced and were caught before they caused damage:**
1. Three of the four worktrees correctly forked from the up-to-date local `main` (and two of those three noticed on their own that an even-earlier state would have been missing `backend/api-go` entirely, and safely fast-forward-merged before starting). The fourth (private/public profile) forked from `origin/main` — the last **pushed** commit, three commits behind local `main` — and never updated. Its diff would have silently reverted the Coarea→Kemago rename, the email+password auth work, and the Go feed-domain migration if merged as-is. Caught by comparing each worktree's `git log -1` before merging; the profile agent's actual code changes (small, clean, four files) were manually re-applied onto the current file versions instead of blind-copying its worktree files.
2. Three agents independently reported `pnpm --filter @kemago/mobile type-check` failing repo-wide (~124 errors, every `className`-using file). Investigated instead of trusting it: `apps/mobile/src/uniwind-types.d.ts` is a real file that exists in the main checkout but is gitignored (auto-generated, never committed) — a fresh git worktree naturally lacks it, so every fresh worktree saw a false "pre-existing repo-wide failure" that doesn't exist in the actual repo. One agent (Block) had already "fixed" this by adding a new tracked `uniwind-env.d.ts` with a manual type reference — this was **not** merged, since it solves a worktree artifact, not a real problem, and `.gitignore` excluding the generated file was an earlier deliberate choice.

**Merge process:** each agent left its work uncommitted in its worktree (not on a committed branch) — merged by copying each agent's new, self-contained files directly, and manually re-applying the shared `internal/db/models.go`/`internal/db/migrate.go` diffs one at a time (all three purely additive, no real conflicts, just sequential application). Integration work then done directly on `main` (not by any agent):
- `main.go`: registered `clubs.Register`, `polls.Register`, `blocks.Register` alongside the existing `feed.Register`
- `feed.go`: added `author_id`/`authorId` to the post query and response (didn't exist before — needed so the mobile client can target a block action, and so the block filter has something to filter on), and `listPosts` now calls `blocks.BlockedIDs` for the requesting user (if authenticated) and drops posts by anyone in that list
- Mobile: added `BlockUserButton` to `PostCard.tsx` (bottom row, next to like/reply counts — couldn't hide it on the viewer's own posts since `useAuthStore` doesn't expose the signed-in user's real backend id anywhere yet, only email/token; self-block is already rejected server-side with a 422 so the cost of that gap is a harmless inline error). `Post`/`ApiPost` types and `postsRepo.native.ts`'s SQLite schema gained `authorId` to carry this through.
- `PollCard`/`PollComposer` were **not** wired into `FeedScreen`/`PostCard` — doing that well needs a `hasPoll` flag added to Feed's list response first (a real, if small, API change), left as a follow-up rather than rushed.

**Verified live** against the real dev Postgres: full authenticated round-trip through a real signed-up email+password account (not seeded SQL) — created a club (auto-leader, memberCount correct), confirmed leader can't leave without handing off (422), created a post, attached a poll, voted, confirmed vote counts and `myVoteOptionId`, blocked a second real user, confirmed their post disappeared from `GET /api/posts`, confirmed it's `GET /api/blocks`-listed, unblocked implicitly verified via cascade delete cleanup. `go build`/`go vet`/`gofmt -l` clean on `backend/api-go` with all three new packages; `tsc --noEmit` clean on `backend/better-auth` and `apps/mobile`; `expo export --platform web` succeeded with `/clubs`, `/blocked-users` routes present. All test data (club, posts, poll, block, throwaway account) cleaned up afterward — verified every affected table back to zero rows via cascade deletes.
**Next:** Wire `PollCard`/`PollComposer` into the actual Feed (needs a `hasPoll` response field on Module: Feed). Club leader hand-off has no UI trigger yet. `M-011` (verified posting) is still blocked on an unrelated, unresolved product decision (identity verification method) — nothing in this stage touches it.
**Blockers:** none

**Dispatch-In:** none — direct interactive session with the client
**Gate-Out:** n/a
**Merge-Approval:** n/a

---

### stage-25-friends-room-membership

**Domain:** backend/api-go, apps/mobile
**Depends On:** stage-24-clubs-polls-blocks-privacy
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Mutual friend-request flow: send/accept/decline/remove/list, backed by a real `friendships` table (CONTRACTS.md → Friend)
- [x] Room membership: join/leave/list-members, backed by a real `room_members` table (CONTRACTS.md → Room)

**Done:** Client asked for two more tables in quick succession ("add friend table relation กับ user", then "group member table relation กับ user"). Built directly on `main` rather than spawning parallel agents this time — both fit comfortably as sequential edits against the exact same patterns stage-24 just established (Bun models in `internal/db/models.go`, bootstrap SQL in `migrate.go`, a per-domain package with its own JSON helpers, `authcheck.RequireUser` for Bearer auth, `db.NewRaw(...).Scan(...)` with `?` placeholders for raw SQL).

Friends: new `internal/friends` package. `friendships` is a directed request row (`requester_id`, `addressee_id`, `status`) rather than a plain undirected "friends" table, since "add friend" implies request/accept semantics, not an admin-inserted static relation. The one non-obvious piece: sending a request to someone who already requested you resolves to an immediate accept (checks both directions of the composite PK before deciding whether to insert a new pending row or update an existing one) — the alternative (silently rejecting or creating a duplicate reversed row) would be worse UX for a case that's completely normal (two people both hit "add friend" around the same time).

"Group member" was interpreted as **room** membership — `rooms` already existed (Feed's posts belong to one) but had no membership concept at all, only `created_by`. Rather than invent a new, unrelated "Group" entity with no home anywhere else in the schema/CONTRACTS.md, added `room_members` (mirroring `club_members` exactly) directly in `internal/feed/feed.go`, since Room's handlers already live there. `roomOut` gained `memberCount`/`joined` (same shape Club already has); `createRoom` now auto-joins the creator, matching Club's auto-leader-join pattern.

**Verified live** against the real dev Postgres, with two real signed-up email+password accounts (not seeded SQL): A sent a friend request to B, B saw it in incoming requests, a duplicate request from A correctly rejected (422), B accepted, both A's and B's friend lists correctly showed each other, A removed B, B's list went back to empty. Separately: created a room (auto-joined creator, `memberCount: 1`), had the second account join it, confirmed `memberCount: 2`/`joined: true` from the creator's perspective and both users listed in `/members`. `go build`/`go vet`/`gofmt -l` clean on `backend/api-go`; `tsc --noEmit` clean on `apps/mobile` after adding `friendsApi.ts`. All test data (two accounts, the room) cleaned up afterward.
**Next:** No mobile UI for either — `friendsApi.ts` exists but nothing calls it from a screen yet (no "People"/friend-list screen exists in the app at all); room membership has no mobile API client or UI yet either, since it was requested as a backend primitive ahead of a specific screen needing it. The mutual-auto-accept behavior in `sendRequest` should be spot-checked against product expectations once there's a UI actually exercising it — it was a judgment call, not something the client specified.
**Blockers:** none

**Dispatch-In:** none — direct interactive session with the client
**Gate-Out:** n/a
**Merge-Approval:** n/a

---

### stage-26-friends-ui

**Domain:** apps/mobile
**Depends On:** stage-25-friends-room-membership
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] A screen showing incoming friend requests (accept/decline) and current friends (remove)
- [x] A way to send a request from somewhere already in the app, not just an API client nobody calls

**Done:** Client asked to build the UI for stage-25's Friend API, which had no screen at all. Two touchpoints: `FriendsScreen` (`app/friends.tsx`, reachable via a new "Friends" row on `ProfileScreen` right above the existing "Blocked users" row, same pattern) shows incoming requests with accept/decline above a friends list with remove; and a new standalone `AddFriendButton` (mirrors `BlockUserButton`'s self-contained shape exactly) sits next to the block button on every `PostCard`, since that's the only place in the app a user currently sees another real person's identity to act on. Room/group membership (also from stage-25) intentionally got no UI this round — there's no "Rooms" screen anywhere in the app to hang it off, unlike Clubs which already has a tab; asked the client separately whether a dedicated Rooms screen is wanted before building one speculatively.

**Verified:** `pnpm --filter @kemago/mobile type-check` and `npx expo export --platform web` both clean, `/friends` route present in the export. Not re-tested live against the API this round — the underlying `/api/friends/*` endpoints were already fully live-verified in stage-25 with two real accounts, and the mobile code's expected response shapes (`userId`/`name`/`verified`/`createdAt`, `{status: "pending"|"accepted"}`) were checked directly against that stage's actual curl output rather than re-run.
**Next:** Rooms/Groups screen — pending client decision on whether it's wanted.
**Blockers:** none

**Dispatch-In:** none — direct interactive session with the client
**Gate-Out:** n/a
**Merge-Approval:** n/a

---

### stage-27-rooms-ui

**Domain:** apps/mobile
**Depends On:** stage-26-friends-ui
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] A screen to browse/create/join/leave rooms
- [x] A way to see who's in a room

**Done:** Client confirmed a dedicated Rooms screen was wanted (asked after stage-26 left it as an open question). Built `roomsApi.ts` + `RoomsScreen` (`app/rooms.tsx`, list/create/join/leave — same structure as `ClubsScreen`, since Room and Club are functionally identical join-a-group-of-people concepts, just without Club's leader/description/category fields) + `RoomMembersScreen` (`app/room/[id]/members.tsx`, same structure as `PostDetailScreen`/`BlockedUsersScreen`), reachable from a new "Rooms" row on `ProfileScreen` below "Friends" — a plain nav row, not a bottom tab, since Rooms doesn't have the same standing as Clubs in the product (client never asked for a Rooms tab, only the table + now the screen).

**Verified:** `pnpm --filter @kemago/mobile type-check` and `npx expo export --platform web` both clean, `/rooms` and `/room/[id]/members` present in the export. Also live-tested directly against the real dev Postgres with one throwaway account: created a room via the exact `POST /api/rooms` call `roomsApi.ts` makes, confirmed the response shape (`id, name, memberCount, joined`) matches `ApiRoom` exactly, confirmed `GET /api/rooms` and `GET /api/rooms/:id/members` also match `roomsApi.ts`'s expected shapes byte-for-byte. Test account and room cleaned up afterward.
**Next:** None — client said they'll test it themselves from here.
**Blockers:** none

**Dispatch-In:** none — direct interactive session with the client
**Gate-Out:** n/a
**Merge-Approval:** n/a

---

<!-- Add one section per stage -->

## Deploy Checklist (run after every stage)

```bash
pnpm test
# add deploy commands for your stack here
```

All checks must pass before Conductor writes merge-approval.
