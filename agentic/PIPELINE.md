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
| stage-3-agent-cost-and-monitor-dashboard | apps/api/src/domains/agent, apps/admin | none | IN_PROGRESS |

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

<!-- Add one section per stage -->

## Deploy Checklist (run after every stage)

```bash
pnpm test
# add deploy commands for your stack here
```

All checks must pass before Conductor writes merge-approval.
