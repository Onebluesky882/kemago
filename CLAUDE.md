# Agent Rules

## File Location Rules — NEVER VIOLATE

**All governance files MUST live inside `agentic/`. Never create or modify governance files at the project root.**

Files allowed at root: `CLAUDE.md`, `README.md`, and code directories (`apps/`, `packages/`, config files).

If you find any governance file at root (e.g. `PIPELINE.md`, `AGENT_RULES.md`, `START_HERE.md`), do NOT use it — read from `agentic/` instead.

---

## Frontend Navigation Rules — NEVER VIOLATE

**NEVER use `<a href>` for internal links in `apps/web` or `apps/admin`.**

Internal navigation must use:
- `<Link href="...">` from `next/link` — for static links in JSX
- `router.push("...")` from `useRouter` — for programmatic navigation

`<a>` tags are ONLY allowed for:
- External URLs (`https://...`)
- Email links (`mailto:...`)

Reason: `<a>` causes full page reload which resets global auth state and causes header flash.

---

## Before Starting Any Task

**MANDATORY — Every agent must read `agentic/START_HERE.md` before doing anything else. No exceptions.**

**For any UI/frontend task: also read `agentic/DESIGN_SYSTEM.md` before writing a single line of UI code.**

If you are a worker agent assigned to a PIPELINE.md stage:
1. Read agentic/START_HERE.md first
2. Read agentic/AGENT_RULES.md
3. Confirm your assigned stage's `agentic/tasks/stage-XX-<name>.md` has Status: READY/IN_PROGRESS before beginning work

## ADR Numbering

**MANDATORY — do this before creating any ADR, no exceptions:**

```bash
ls agentic/docs/adrs/ | sort | tail -3
```

Take the highest number shown, add 1, use that as your ADR number.

Rules:
- Never guess or assume the next number
- Never create a file without running the check above first
- File name: `NNN-short-slug.md` (zero-padded to 3 digits)
- Header inside the file must match the filename exactly:
  ```
  # ADR NNN — Title
  ```
- This rule applies in every worktree — the `agentic/docs/adrs/` directory is shared via git
