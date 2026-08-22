# PIPELINE.md

Status: PLANNING
Owner: CONDUCTOR
Conductor Branch: <conductor-branch>

---

## Stage Overview

| Stage | Domain | Depends On | Status |
|-------|--------|------------|--------|
| stage-1-setup | <!-- domain --> | none | PLANNING |

---

## Stage Detail

### stage-1-setup

**Domain:** <!-- e.g. root, apps/*, packages/* -->
**Depends On:** none
**Status:** `PLANNING`

**Acceptance Criteria:**
- [ ] <!-- criterion 1 -->
- [ ] <!-- criterion 2 -->

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

<!-- Add one section per stage -->

## Deploy Checklist (run after every stage)

```bash
pnpm test
# add deploy commands for your stack here
```

All checks must pass before Conductor writes merge-approval.
