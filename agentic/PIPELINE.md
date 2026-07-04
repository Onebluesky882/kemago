# PIPELINE.md

Status: PLANNING
Owner: CONDUCTOR
Conductor Branch: main

---

## Stage Overview

| Stage | Domain | Depends On | Status |
|-------|--------|------------|--------|
| stage-1-setup | <!-- domain --> | none | PLANNING |
| stage-2-claude-md-scope-rule | CLAUDE.md | none | COMPLETE |
| stage-3-agent-cost-and-monitor-dashboard | apps/api/src/domains/agent, apps/admin | none | COMPLETE |
| stage-4-discord-and-nowpayments-services | apps/api/src/domains/discord, apps/api/src/domains/nowpayments | none | COMPLETE |
| stage-5-service-readiness-audit | apps/api/src/domains/agent, apps/api/src/domains/user, apps/api/src/domains/payment, packages/db/migrations, CLAUDE.md | none | COMPLETE |

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

### stage-2-claude-md-scope-rule

**Domain:** CLAUDE.md
**Depends On:** none
**Status:** `COMPLETE`

**Done:** Added "Scope Discipline" rule to CLAUDE.md — instructs the conductor to never do work beyond what was explicitly requested (e.g. mock UI only → no API/DB/hooks).
**Next:** Optionally enforce via pre-write hook in `.claude/settings.json`.
**Blockers:** None.

---

### stage-3-agent-cost-and-monitor-dashboard

**Domain:** apps/api/src/domains/agent, apps/admin
**Depends On:** none
**Status:** `COMPLETE`

**Done:**
- Added `cost_usd` column to `agent_logs` (`packages/db/migrations/agent-cost.sql`) + `estimateCostUsd()` helper (`agent.handler.ts`) using Sonnet 5 pricing ($3/$15 per MTok) — update the constant if `ANTHROPIC_AGENT_ID` uses a different model tier.
- Added `GET /api/agent/stats?days=N` — daily-bucketed cost/token/run/error/latency aggregates + totals, backing the new monitor dashboard.
- Built a theme-aware monitor chart component library in `apps/admin/components/monitor/` (trend bar chart, segmented part-to-whole bar, radial meter, sparkline, activity list, range toggle) per the dataviz skill's validated palette — colors reference CSS custom properties, not hardcoded hex.
- Added full light/dark theme support to `apps/admin`: `app/globals.css` (CSS var tokens, light + dark), `hooks/use-theme.ts`, inline theme-init script in `app/layout.tsx` to avoid flash-of-wrong-theme, toggle wired into both `/login` and the dashboard sidebar.
- Redesigned `/login` page and `(dashboard)` sidebar/layout to match a "tech monitoring dashboard" visual direction (dark-capable, icon nav, focus/hover/loading states) per `agentic/DESIGN_SYSTEM.md`.
- Observability page (`/observability`) now shows `cost_usd` per row + a total.
- (Prior commit) Session-hydration and Bearer-token auth bugs previously logged here were already fixed before this pass — `auth.store.ts` persists `token` via zustand `persist`, `hooks/use-api.ts` is the Bearer-token fetch wrapper, `use-session.ts` waits for hydration before checking session. Confirmed still in place; not re-touched.
- Added `hooks/use-agent-stats.ts` (wraps `GET /api/agent/stats?days=N` via `apiFetch`) and `hooks/use-agent-logs.ts` (wraps `GET /api/agent/logs`).
- Fixed `components/dashboard/stat-card.tsx` — it hardcoded light-only hex colors, which would have rendered as a white card on the new dark theme; now reads the same CSS custom properties as the rest of `components/monitor/`.
- Built the full `/dashboard` overview page: existing system-status tiles (API/DB/storage/user) + new agent stat tiles (total cost, total runs, success rate, avg latency) with sparklines, a cost trend chart, a success-rate radial meter, a success/error segmented bar, and a recent-activity feed — all driven by `useAgentStats`/`useAgentLogs`, with a 7/30/90-day `RangeToggle`.
- Built `/monitor/cost`: total cost, avg cost/run, cost trend chart, input/output token segmented bar, daily cost table.
- Built `/monitor/health`: success rate, avg latency, latency trend chart, success-rate meter, runs-per-day trend.
- Built `/monitor/errors`: total errors, error rate, errors-per-day trend, success-rate meter, table of the 15 most recent failed runs with error messages.
- Sidebar nav already had `/dashboard`, `/monitor/cost`, `/monitor/health`, `/monitor/errors` entries in `NAV_LINKS` (added ahead of the pages existing) — no nav changes needed, links now resolve.
- Verified `tsc --noEmit` passes clean in `apps/admin` and all four routes return 200 from the dev server (unauthenticated → redirected by the layout's session guard, no server error).

**Next:**
- No open work on this stage. Future stage could add server-side auth to `/observability`'s `fetch` call (still uses `credentials: 'include'` without the Bearer wrapper) — noticed during this pass but left untouched as out of scope.

**Blockers:** None.

---

### stage-4-discord-and-nowpayments-services

**Domain:** apps/api/src/domains/discord, apps/api/src/domains/nowpayments
**Depends On:** none
**Status:** `COMPLETE`

**Done:**
- Confirmed the Telegram bot service already existed (`apps/api/src/domains/telegram/`, mounted at `/webhook/telegram` + `/webhook/notify`) — left untouched, no changes needed.
- Added `apps/api/src/domains/discord/` — a Discord bot service following the same shape as `telegram`:
  - `discord.route.ts` — `POST /api/discord/interactions` (Discord Interactions Endpoint: verifies the `X-Signature-Ed25519`/`X-Signature-Timestamp` headers via Web Crypto Ed25519, handles `PING` and a `/help` slash command stub with a `// TODO` for custom commands) and `POST /api/discord/notify` (send a message to a channel by ID — callable from any other route).
  - `discord.service.ts` — `sendDiscordMessage()` (Discord REST `POST /channels/{id}/messages`) and `verifyDiscordRequest()` (Ed25519 signature check, no external deps — Cloudflare Workers' native Web Crypto supports the `Ed25519` algorithm).
  - `discord.schema.ts` — zod schema for `/notify`.
  - `discord.route.test.ts` — generates a real Ed25519 keypair via `node:crypto` at test time and signs requests for real, rather than mocking the crypto call; covers missing/invalid signature (401), `PING`, `/help`, unknown command, and `/notify` (incl. 400 on missing fields).
- Added `apps/api/src/domains/nowpayments/` — a crypto-payment service mirroring `payment` (Stripe)'s shape:
  - `nowpayments.route.ts` — `POST /api/nowpayments/invoice` (creates a NOWPayments-hosted invoice; caller supplies `ipnCallbackUrl`/`successUrl`/`cancelUrl`, same pattern as Stripe's `/checkout`), `GET /api/nowpayments/status/:paymentId`, `POST /api/nowpayments/webhook` (IPN receiver — verifies `x-nowpayments-sig` via HMAC-SHA512 over the recursively-key-sorted JSON body per NOWPayments' spec; order fulfillment left as a `// TODO`, same as the Stripe webhook's `purchases` table write, since there's no price→plan mapping defined for crypto yet).
  - `nowpayments.handler.ts` — `createInvoice()`, `getPaymentStatus()`, `verifyIpnSignature()`.
  - `nowpayments.schema.ts` — zod schemas for invoice creation.
  - `nowpayments.route.test.ts` — mocks `fetch` for invoice creation/status, and generates a real HMAC-SHA512 signature via `node:crypto` to test the webhook guard (valid, invalid, and missing-signature cases).
- Wired both routers into `apps/api/src/index.ts` (`/api/discord`, `/api/nowpayments`) and added their `Bindings` fields (`DISCORD_PUBLIC_KEY`, `DISCORD_BOT_TOKEN`, `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`).
- Documented the four new secret names in `apps/api/wrangler.toml`'s secrets comment block (same pattern as `BOT_TOKEN`/`TELEGRAM_SECRET_TOKEN`).
- `tsc --noEmit` passes clean for the new code; `pnpm test` — 8 test files, 30 tests, all passing (up from 7 files before this stage). Two pre-existing, unrelated failures in `payment.handler.ts`/`payment.route.ts` (Stripe SDK `apiVersion` literal-type drift from a `stripe` package bump) were noticed but are out of scope for this stage — not introduced by this change.

**Next:**
- No UI was built for these two services (not requested) — no `/discord` or `/nowpayments` admin page exists yet, unlike `/agent` or `/observability`. Ask before adding one.
- NOWPayments webhook fulfillment logic is a stub (`// TODO`) — needs the client's actual price→plan mapping before it can mark orders paid.
- Discord slash commands need to be registered with Discord's API separately (not done here — typically a one-time script using `DISCORD_BOT_TOKEN` + `DISCORD_APPLICATION_ID`, which isn't yet a binding).

**Blockers:** None.

---

### stage-5-service-readiness-audit

**Domain:** apps/api/src/domains/agent, apps/api/src/domains/user, apps/api/src/domains/payment, packages/db/migrations, CLAUDE.md
**Depends On:** none
**Status:** `COMPLETE`

**Done:** Audited all 13 API domains for "can a new conductor pick this template up and use the services as-is, with no rebuilding." Found and fixed:
- **Missing `roadmap.sql` migration** — `roadmap_phases`/`roadmap_tasks` tables (used by the protected `roadmap.route.ts`) had a Drizzle schema (`packages/db/src/schema/roadmap.ts`) but no corresponding `CREATE TABLE` migration anywhere. On a fresh D1 database the entire Roadmap service would 500 on first query. Added `packages/db/migrations/roadmap.sql` matching the Drizzle schema exactly.
- **`trustedOrigins` hardcoded with blank placeholders in 3 domains** — `agent.route.ts`, `user.route.ts`, `payment.route.ts` had a module-level `TRUSTED_ORIGINS` array with two literal `''` entries and did not read `ALLOWED_ORIGINS` from the environment, unlike `auth.route.ts`/`forum.route.ts`/`roadmap.route.ts` which correctly do. `user.route.ts` didn't even declare `ALLOWED_ORIGINS` in its `Bindings` type. This meant `/api/user/me` (the session-check endpoint every frontend page's auth guard calls), `/api/agent/*`, and `/api/payment/*` would never trust the real deployed frontend origin once `ALLOWED_ORIGINS` is filled in per the First-Deploy Checklist. Fixed all three to derive trusted origins from `c.env.ALLOWED_ORIGINS`, same pattern as `auth.route.ts`.
- **Stripe `apiVersion` type-check failure** — `payment.handler.ts` and `payment.route.ts` pinned `'2026-05-27.dahlia'`, but the installed `stripe` package (`22.3.0`) only accepts `'2026-06-24.dahlia'` as a type. `tsc --noEmit` failed on this before the fix (pre-existing, not introduced by prior stages — just never caught because `pnpm test` doesn't type-check). Updated both literals; `tsc --noEmit` now passes clean across the whole `apps/api` package.
- **First-Deploy Checklist in `CLAUDE.md` only ran `auth.sql`** — there are 17 migration files total (16 pre-existing + the new `roadmap.sql`), and several are `ALTER TABLE` statements that depend on earlier `CREATE TABLE` files. Alphabetical order does **not** match dependency order (e.g. `agent-cost.sql` sorts before `observability.sql`, which creates the table `agent-cost.sql` alters; same issue with `agent-deploy.sql` vs `agent.sql`, and `auth-role.sql` vs `auth.sql`). Rewrote the checklist step to loop through all 17 files in explicit, dependency-correct order, with a note not to glob `*.sql`.
- **`CLAUDE.md`'s "Already provided / Do NOT create" table was missing 3 real services** — Telegram, Discord, and NOWPayments existed in code but weren't listed, so a future conductor reading only that table would not know they exist and could rebuild them from scratch. Added all three rows.
- Verified: `tsc --noEmit` clean, `pnpm test` 8/8 files, 30/30 tests passing, after all fixes.

**Next:** None outstanding from this audit. Lower-priority items noted but not fixed (out of scope for this pass, flagged for a future stage if the client wants them): `agent` domain still has no test file (most complex domain — SSE streaming, cost calc, raw D1 writes); Stripe payment service has a backend but zero frontend checkout UI in `apps/web`; DB access is inconsistent between Drizzle-managed tables (auth/purchases/forum/roadmap) and raw-SQL-managed tables (agent_logs/agent_sessions/setup_submissions) — no compile-time schema safety for the latter group.

**Blockers:** None.

---

<!-- Add one section per stage -->

## Deploy Checklist (run after every stage)

```bash
pnpm test
# add deploy commands for your stack here
```

All checks must pass before Conductor writes merge-approval.
