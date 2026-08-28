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
| stage-4-backend-scaffold | new Go backend service | stage-1-setup | PLANNING |
| stage-5-auth | Go backend, apps/mobile | stage-4-backend-scaffold | PLANNING |
| stage-6-mobile-shell | apps/mobile | stage-1-setup | PLANNING |
| stage-7-feed | Go backend, apps/mobile | stage-5-auth, stage-6-mobile-shell | PLANNING |
| stage-8-event | Go backend, apps/mobile | stage-5-auth, stage-6-mobile-shell | PLANNING |
| stage-9-profile | Go backend, apps/mobile | stage-5-auth, stage-6-mobile-shell | PLANNING |
| stage-10-chat | Go backend, apps/mobile | stage-5-auth, stage-6-mobile-shell | PLANNING |
| stage-11-mobile-jobs-sport-clubs | apps/mobile | stage-6-mobile-shell | COMPLETE |

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

**Done:** Walked the client through QUESTIONS.md (Thai language session). Project: Coarea, a local-first social app (feed/community/events). Client is a developer, mobile-first (Expo/React Native + TypeScript), backend in Go self-hosted via OrbStack, PostgreSQL database — a deliberate deviation from the template's default Hono-on-Cloudflare-Workers/D1 stack (recorded in DECISIONS.md → Coarea Tech Stack). `apps/web`/`apps/admin` deprioritized until client asks. Governance files updated accordingly.
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
- `package.json` / `tsconfig.json` — standalone (not extending `@gover-agent/config`, kept self-contained so the Dockerfile build context doesn't need the rest of the monorepo), scripts: `dev` (tsx watch), `build` (tsc → `dist/`), `start`
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
**Status:** `PLANNING`

**Acceptance Criteria:**
- [ ] Go module scaffolded (location TBD — e.g. `apps/backend` or `services/api`)
- [ ] PostgreSQL container running via OrbStack, migrations tooling chosen (e.g. `golang-migrate`)
- [ ] Health check endpoint (`GET /healthz`)
- [ ] CORS policy defined for mobile app origin(s)
- [ ] `go test`, `gofmt`, `golangci-lint` wired up

**Dispatch-In:** `tasks/stage-4-backend-scaffold.md`
**Gate-Out:** `gate-out/stage-4-backend-scaffold.md`
**Merge-Approval:** `merge-approval/stage-4-backend-scaffold.md`

---

### stage-5-auth

**Domain:** Go backend, apps/mobile
**Depends On:** stage-4-backend-scaffold
**Status:** `PLANNING`

**Acceptance Criteria:**
- [ ] `POST /v1/auth/register`, `POST /v1/auth/login` implemented per CONTRACTS.md → Auth
- [ ] Bearer token (JWT) issuance + validation middleware, no cookies (SECURITY_RULES.md)
- [ ] Mobile app: login/register screens, token storage, authenticated `apiFetch` wrapper

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

<!-- Add one section per stage -->

## Deploy Checklist (run after every stage)

```bash
pnpm test
# add deploy commands for your stack here
```

All checks must pass before Conductor writes merge-approval.
