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

<!-- Add one section per stage -->

## Deploy Checklist (run after every stage)

```bash
pnpm test
# add deploy commands for your stack here
```

All checks must pass before Conductor writes merge-approval.
