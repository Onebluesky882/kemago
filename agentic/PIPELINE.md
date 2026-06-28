# PIPELINE.md

Status: PLANNING
Owner: CONDUCTOR
Conductor Branch: main

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

### stage-2-claude-md-scope-rule

**Domain:** CLAUDE.md
**Depends On:** none
**Status:** `COMPLETE`

**Done:** Added "Scope Discipline" rule to CLAUDE.md — instructs the conductor to never do work beyond what was explicitly requested (e.g. mock UI only → no API/DB/hooks).
**Next:** Optionally enforce via pre-write hook in `.claude/settings.json`.
**Blockers:** None.

---

<!-- Add one section per stage -->

## Deploy Checklist (run after every stage)

```bash
pnpm test
# add deploy commands for your stack here
```

All checks must pass before Conductor writes merge-approval.
