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
**Status:** `IN_PROGRESS`

**Done:**
- Added `cost_usd` column to `agent_logs` (`packages/db/migrations/agent-cost.sql`) + `estimateCostUsd()` helper (`agent.handler.ts`) using Sonnet 5 pricing ($3/$15 per MTok) — update the constant if `ANTHROPIC_AGENT_ID` uses a different model tier.
- Added `GET /api/agent/stats?days=N` — daily-bucketed cost/token/run/error/latency aggregates + totals, backing the new monitor dashboard.
- Built a theme-aware monitor chart component library in `apps/admin/components/monitor/` (trend bar chart, segmented part-to-whole bar, radial meter, sparkline, activity list) per the dataviz skill's validated palette — colors reference CSS custom properties, not hardcoded hex.
- Added full light/dark theme support to `apps/admin`: `app/globals.css` (CSS var tokens, light + dark), `hooks/use-theme.ts`, inline theme-init script in `app/layout.tsx` to avoid flash-of-wrong-theme, toggle wired into both `/login` and the dashboard sidebar.
- Redesigned `/login` page and `(dashboard)` sidebar/layout to match a "tech monitoring dashboard" visual direction (dark-capable, icon nav, focus/hover/loading states) per `agentic/DESIGN_SYSTEM.md`.
- Observability page (`/observability`) now shows `cost_usd` per row + a total.

**Next:**
- Build `/dashboard` overview page (hero trend chart + stat tiles + segmented success/error bar + meter + recent activity) and the `/monitor/{cost,health,errors}` detail pages.
- Wire new routes into the sidebar nav (icons already added to `NAV_LINKS` ahead of the pages existing) and re-run `tsc --noEmit`.
- **Bug found during verification — needs a decision before fixing:** `apps/admin/store/auth.store.ts` has no `token`/`setToken` field and no `persist` middleware (session doesn't survive a page refresh); `apps/admin/hooks/use-auth.ts` reads `token` from a store that doesn't have it; there is no `apps/admin/hooks/use-api.ts` (the Bearer-token fetch wrapper apps/web has); `hooks/use-session.ts` in **both** web and admin calls `fetch('/api/user/me', {credentials:'include'})` with a relative URL and no Bearer token — will not work once admin/web and the API are on separate `workers.dev` subdomains per CLAUDE.md's own Cross-Domain Auth rule. Not yet fixed — awaiting go-ahead since it touches auth in both apps.

**Blockers:** Client input needed on whether to fix the auth/session bug now (see above) before continuing dashboard pages, since a broken session would make the monitor dashboard unreachable in a real deployment.

---

<!-- Add one section per stage -->

## Deploy Checklist (run after every stage)

```bash
pnpm test
# add deploy commands for your stack here
```

All checks must pass before Conductor writes merge-approval.
