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
| stage-6-governance-recheck | agentic/AGENT_RULES.md, agentic/DECISIONS.md | none | COMPLETE |
| stage-7-smoke-test-a | apps/api/src/domains/health | none | COMPLETE (diagnostic — halted by client before merge) |
| stage-7-smoke-test-b | apps/api/src/domains/setup | none | COMPLETE (diagnostic — halted by client before merge) |
| stage-8-web-services-showcase | apps/web/app/page.tsx | none | COMPLETE |
| stage-9-fix-dashboard-purchase-bug | apps/web/app/dashboard/page.tsx | none | COMPLETE |
| stage-10-setup-page-redesign | apps/web/app/setup/page.tsx, apps/web/components/setup/*, apps/web/app/globals.css | none | COMPLETE |
| stage-11-chat-ops-core-package | packages/chat-ops-core, README.md | none | COMPLETE |

---

## Parallel Dispatch Proof — stage-7-smoke-test-a / stage-7-smoke-test-b

**Purpose:** These two stages are a deliberate smoke test of the Conductor/Worker/worktree/gate-out/merge-approval mechanism described in CONDUCTOR.md, AGENT_RULES.md, and START_HERE.md — which had never been exercised even once in this repo (see stage-6-governance-recheck findings). They are intentionally trivial and touch disjoint domains (health vs setup) so that the real risk of running the real ceremony is near zero.

**Parallel Dispatch Rule check (per CONDUCTOR.md):**
- Both stages: Status `PENDING` → `IN_PROGRESS`, Depends On: none, Depends On stages: none (trivially COMPLETE)
- No shared file, no shared domain, no shared DB row → eligible for simultaneous dispatch
- Client proposal + confirmation: satisfied by the client's explicit request to run "Full proof" of this exact plan

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

### stage-6-governance-recheck

**Domain:** agentic/AGENT_RULES.md, agentic/DECISIONS.md
**Depends On:** none
**Status:** `COMPLETE`

**Done:** Read all 16 files under `agentic/` plus `CLAUDE.md` end-to-end and cross-checked them against actual repo state (git history, `.claude/settings.json`, `.claude/hooks/`). Found and fixed 3 stale-documentation issues:
- `AGENT_RULES.md`'s License Gate Rule claimed `license_status: active` is "enforced now — via hook" by `.claude/hooks/license-check.sh`. That hook was deliberately deleted in commit `2990989` ("chore: remove license check system") along with its `settings.json` entry, but this section was never updated to match — it still described a control that hasn't existed since that commit. Rewrote it to state the gate is currently a manual Conductor check (matching how `CONDUCTOR.md` and `SECURITY_RULES.md` already correctly described it).
- `DECISIONS.md` had an unfilled `## Decision: [Title]` template stub (with a literal `Date: YYYY-MM-DD`) sitting between two real, accepted decisions instead of at the end of the file, where a `<!-- Add one section per decision -->` comment already serves that purpose. Removed the stray stub.
- The "Anthropic Managed Agents for Web-Based Code Editing" decision had never had its `YYYY-MM-DD` placeholder filled in despite being `ACCEPTED`. Backfilled with `2026-06-23`, confirmed via `git log` (first commit touching `apps/api/src/domains/agent/`).

**Also confirmed (no change made — client explicitly asked to leave as-is):** `PROJECT.md`, `ARCHITECTURE.md`, `CONTRACTS.md`, and `QUESTIONS.md` are still 100% unfilled template scaffolding (`[TBD]` throughout), and the full Conductor→Worker→worktree→gate-out→merge-approval ceremony described across `CONDUCTOR.md`/`START_HERE.md`/`AGENT_RULES.md`/`QUESTIONS.md` has never actually been exercised in this repo (`agentic/tasks/`, `gate-out/`, `merge-approval/`, `rejection/` contain only `.gitkeep`). All real work to date has happened directly on `main` via direct conversation, which does satisfy every rule that is actually hook-enforced (`client-type-check.sh`, `governance-english-only.sh`, `pipeline-roadmap-guard.sh`, `gate-out-typecheck.sh`, `merge-approval-guard.sh`, `no-main-branch.sh`) — the gap is only between documented *aspirational* ceremony and what's mechanically enforced, not a violation of anything that actually runs. Client confirmed this repo is meant to stay a distributable, pristine template on those four files — do not fill them in.

**Next:** None. If a future stage wants the full Conductor ceremony actually exercised (worktrees, gate-out, merge-approval) rather than direct-on-main work, that's a workflow decision for Dev, not a text fix.

**Blockers:** None.

---

### stage-7-smoke-test-a / stage-7-smoke-test-b

**Domain:** apps/api/src/domains/health, apps/api/src/domains/setup
**Depends On:** none (dispatched in parallel per stage-6's own finding that this mechanism had never been exercised)
**Status:** `COMPLETE` (as a diagnostic — the underlying trivial edits were deliberately never merged; client chose to halt before completing the full ceremony)

**Done:** Ran the first real dry-run of the Conductor/Worker/worktree/gate-out mechanism described in `CONDUCTOR.md`/`AGENT_RULES.md`/`START_HERE.md`, using the Agent tool's `isolation: "worktree"` feature to dispatch two real Worker sub-agents simultaneously, each confined to a trivial, disjoint domain (`health` vs `setup` — a one-line explanatory comment, nothing else). Findings:

- **Worktree isolation works mechanically.** `git worktree list` confirmed two real, separate worktrees/branches were created and used independently — this part of the documented mechanism is sound.
- **Conductor process gap found:** the stage-7 rows were added to `PIPELINE.md` but never *committed* before dispatch. `git worktree add` branches from the last commit, not from uncommitted working-tree state, so neither worker's worktree actually contained the stage-7 entries their own onboarding doc (`START_HERE.md`) told them to look up. `CONDUCTOR.md`'s dispatch steps never mention that PIPELINE.md must be committed first — this is a real, previously-undocumented precondition.
- **`gate-out-typecheck.sh` hook is not domain-scoped.** It runs `pnpm type-check` from the repo root (monorepo-wide), not scoped to the worker's assigned domain. This surfaced a genuine, previously-unknown, pre-existing bug: `apps/web/app/dashboard/page.tsx:71` — `Cannot find name 'purchase'` (TS2304) — which fails the root-level type-check and would block gate-out for *any* worker in *any* domain, regardless of relevance. (Every prior type-check run this session was scoped per-app — `cd apps/api && pnpm type-check`, `cd apps/admin && pnpm type-check` — never the root-level command, so this was never caught before.)
- **Hook bypass suspected.** The `stage-7-smoke-test-b` worker's gate-out file exists on disk with `status: FAIL` despite `gate-out-typecheck.sh` being written to `exit 2` (block the write) on a failing type-check. This strongly suggests the file was created via a `Bash` command (`cat`/`echo`/heredoc) rather than the `Write` tool, since the `PreToolUse` hook matcher only intercepts `Write|Edit` — a real enforcement gap, not yet confirmed by inspecting the worker's own tool-call transcript.
- Both agent runs were cut off mid-task by the session's own API usage limit before reaching the commit step, so the `pipeline-roadmap-guard.sh` behavior (blocking a worker's commit for not touching PIPELINE.md/ROADMAP.md) was never actually observed.

Cleanup performed: both worktrees and their branches were removed (`git worktree remove`, `git branch -d`); nothing from either worker's changes was merged into `main`.

**Next:** If this ceremony is to be used for real in the future: (1) Conductor must commit PIPELINE.md changes before creating any worktree, (2) `gate-out-typecheck.sh` should be scoped to the worker's assigned package/domain rather than the whole monorepo, (3) the pre-existing `apps/web/app/dashboard/page.tsx` TS2304 error should be fixed independent of this, (4) consider whether hooks matching only `Write|Edit` are sufficient given workers can write files via `Bash` instead.

**Blockers:** None — halted by client choice, not by a technical blocker.

**Session cost:** ~117k combined sub-agent tokens across both workers, neither of which completed; both cut off by hitting the session's API usage limit.

---

### stage-8-web-services-showcase

**Domain:** apps/web/app/page.tsx
**Depends On:** none
**Status:** `COMPLETE`

**Done:** Client asked to leave the actual Payment Gateway checkout flow as a prepared-but-not-wired-up backend service (see stage-5's finding: Stripe backend exists, no checkout UI yet), and instead expand the homepage's existing "Services included" section to accurately list every category of service this starter kit actually includes — without naming specific vendors/brands (no "Stripe", "NOWPayments", "Cloudflare D1/R2", "Telegram", "Discord", "Anthropic/Claude" anywhere in the copy).

- Expanded `SERVICES` array in `apps/web/app/page.tsx` from 6 to 11 cards, reusing the existing card/icon design system already established on this page (no new components, no new page routes — this is a content addition to an existing section).
- Added: **Security** (encrypted secrets, protected APIs, verified requests), **Database**, **File Storage**, **AI Assistant** (reused the same bot icon already used in the admin sidebar's "AI Agent" nav item, for visual consistency), **Chat Bot Integration** (generic copy covering both Telegram and Discord without naming either).
- Broadened the existing "Online Payments" card into **Payment Gateway**, updating its description to mention both card and cryptocurrency payments generically (covers both Stripe and NOWPayments without naming them).
- Left **Authentication**, **Community Forum**, **Admin Dashboard**, **Project Roadmap**, **Email Notifications** as they were.
- Verified: `pnpm type-check` in `apps/web` shows only the pre-existing, unrelated `purchase` bug in `app/dashboard/page.tsx` (found during stage-7's smoke test, not yet fixed — out of scope for this stage since client's request here was explicitly to *not* build the payment UI, only showcase the service) — the homepage edit itself introduces zero new errors. Started the dev server and confirmed via `curl` that all 6 new card titles render on the live page (200 OK).

**Next:** The `purchase` bug in `apps/web/app/dashboard/page.tsx:71` (`Cannot find name 'purchase'`) is still unfixed and still blocks a clean root-level `pnpm type-check` for the whole monorepo — flagged to the client, fix not yet authorized.

**Blockers:** None.

---

### stage-9-fix-dashboard-purchase-bug

**Domain:** apps/web/app/dashboard/page.tsx
**Depends On:** none
**Status:** `COMPLETE`

**Done:** Fixed the `purchase` undefined-variable bug found during stage-7/stage-8 (`app/dashboard/page.tsx:71` referenced `purchase?.purchased` but `purchase` was never declared anywhere — dead code left over from an unfinished attempt to surface purchase status). Client's instruction: fix it the same way as the rest of this session's "prepare the service, don't build new UI" pattern — wire it to the payment domain's existing `GET /api/payment/my-purchase` endpoint (already built, already returns `{ purchased, status, githubUsername }`), not a new checkout flow.

- Added `useApi()` import (this app's existing Bearer-token `apiFetch` wrapper — already present in `apps/web/hooks/use-api.ts`, unlike `apps/admin` which was missing it until stage-3) and a `Purchase` type.
- Added a `purchase` state + a `useEffect` that calls `apiFetch('/api/payment/my-purchase')` once `user` is available, following the same pattern as the existing forum-posts effect in this file.
- Did **not** touch the forum fetch in the same file, which still uses `credentials: 'include'` instead of `apiFetch` — a pre-existing, separate issue, out of scope for this fix.
- Verified: `pnpm type-check` in `apps/web` — clean. Root-level `pnpm type-check` (via turbo, all 8 packages) — **clean, 3/3 successful** — this was the last remaining error blocking a whole-monorepo build. Started the dev server and confirmed both `/` and `/dashboard` return 200 with no server error.

**Next:** None for this fix. The monorepo now builds cleanly end-to-end; deploying is no longer blocked by a known compile error.

**Blockers:** None.

---

---

### stage-10-setup-page-redesign

**Domain:** apps/web/app/setup/page.tsx, apps/web/components/setup/*, apps/web/app/globals.css
**Depends On:** none
**Status:** `COMPLETE`

**Done:** Restyled the customer onboarding/setup wizard (question screen, review/summary screen, thank-you screen) to use this project's actual established design tokens and utility classes from `globals.css` (`--accent` pink, `.card`, `.btn-primary`, `.btn-secondary`, `.dot-grid`, `.icon-box`, `.tag`, `.anim-fade-up`) instead of the hardcoded blue/gray hex values it shipped with, which did not match the rest of the site (homepage already uses these tokens/classes). No functional logic was changed — i18n label map, `canProceed` validation, `isFirstStep` back-to-home behavior, `isSubmitting` state, and the `POST /api/setup` submit flow are untouched.

- `OptionButton.tsx`: token-based colors, added a `multi` prop so multi-select questions render a checkbox-style indicator (SVG check) and single-select questions render a radio-style indicator, hover/focus states added.
- `ProgressBar.tsx`: token-based track/fill colors, step counter now uses the site's existing `.tag` pill style, tabular-nums for the percentage.
- `QuestionCard.tsx`: added a new `.setup-field` class (in `globals.css`) for text/textarea inputs with proper focus ring, added a per-question `anim-fade-up` entrance.
- `page.tsx`: all three screens (question, summary, thank-you) now render inside `.card`/`.dot-grid`, nav buttons use `.btn-primary`/`.btn-secondary`.
- Verified: `pnpm --filter @gover-agent/web type-check` — clean (exit 0). Not yet checked in a running browser — a manual visual pass is still recommended before this is shown to a client.

**Next:** Run the dev server and visually confirm the wizard at 375px/768px/1280px per `DESIGN_SYSTEM.md`'s mobile-first rule — not done as part of this pass.

**Blockers:** None.

### stage-11-chat-ops-core-package

**Domain:** packages/chat-ops-core, README.md
**Depends On:** none
**Status:** `COMPLETE`

**Done:** Client had an untracked, already-written chat-bot toolkit sitting at `apps/api/src/domains/chat-ops-core` (Telegram/LINE/Meta webhook verification + parsing, identity linking, command router, Groq NLP text-to-JSON parsing — 9 test files, 54 tests, all colocated). That location was wrong on two counts: (1) the pnpm workspace glob is `apps/*` and `packages/*` — a folder nested three levels inside `apps/api/src` is not a recognized workspace member at all, so `@gover-agent/chat-ops-core` could not be imported by any other package; (2) the package's own `package.json`, `tsconfig.json` (`extends: "../config/tsconfig/cloudflare.json"`), and README already assumed a `packages/chat-ops-core` path — the relative `extends` only resolves correctly one level up from `packages/*`, confirming this was authored for that location and simply dropped in the wrong place.
- Moved the whole directory to `packages/chat-ops-core` (plain `mv`, not `git mv` — the source was untracked) after deleting its stray `node_modules/` and `.turbo/` (gitignored build artifacts that shouldn't have been present pre-move).
- Ran `pnpm install` — confirmed `@gover-agent/chat-ops-core` is now resolved as a real workspace package.
- Verified `pnpm --filter @gover-agent/chat-ops-core run type-check` and `test` both pass clean (54/54 tests), and a full root `pnpm type-check` (turbo, all packages) still passes with zero errors after the move.
- This is a pure library (webhook verify/parse, identity resolution, command dispatch, Groq parsing) with **no HTTP routes** — client explicitly chose not to wire an actual `/api/line/webhook` or `/api/meta/webhook` domain in this pass. A future stage can build one by following the wiring examples already written into `packages/chat-ops-core/README.md`.
- Updated root `README.md`: added `chat-ops-core` to the `packages/` tree listing, and added an "Adding a new chat bot" subsection under "Extending the Template" pointing future conductors at this package instead of writing webhook verification from scratch.

**Next:** No HTTP domain wired yet (LINE/Meta webhooks) — only Telegram has a live route (`apps/api/src/domains/telegram`) and Discord (`apps/api/src/domains/discord`) predate this package and don't use it. If the client wants a LINE or Meta bot live, build `apps/api/src/domains/line` (or `meta`) as `schema.ts`/`handler.ts`/`route.ts` importing from `@gover-agent/chat-ops-core`, mounted in `apps/api/src/index.ts` — same pattern as every other domain. `CLAUDE.md`'s "Already provided" table was not updated in this pass (client asked only for the README) — worth adding a row there too once/if a real route exists.

**Blockers:** None.

<!-- Add one section per stage -->

## Deploy Checklist (run after every stage)

```bash
pnpm test
# add deploy commands for your stack here
```

All checks must pass before Conductor writes merge-approval.
