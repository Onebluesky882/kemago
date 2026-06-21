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

## Auth Session Global Rules — NEVER VIOLATE

**NEVER write a custom `<nav>` inside any page in `apps/web`.**

Every page MUST use the shared `<Navbar>` component from `@/components/navbar`:

```tsx
import { Navbar } from '@/components/navbar'

export default function SomePage() {
  return (
    <div>
      <Navbar />
      ...
    </div>
  )
}
```

**Why:** Pages with their own hard-coded nav always show "Sign in" regardless of auth state — the shared `<Navbar>` reads from Zustand global store which persists across all pages.

**Auth state rules:**
- Global auth state lives in `useAuthStore` (Zustand + localStorage persist)
- `AuthProvider` in `layout.tsx` verifies session with API once on app load
- `onRehydrateStorage` sets `isLoading: false` immediately from localStorage — prevents flash
- NEVER duplicate auth fetch logic inside individual pages or components

---

## CRUD Domain Testing Rules — NEVER SKIP

**Every time you create or modify a CRUD domain (API route + DB table), you MUST:**

### Step 1 — Insert test row
```bash
wrangler d1 execute fullstack-builder-db --remote --command="INSERT INTO <table> (...) VALUES (...)"
```

### Step 2 — Test each operation
Test all operations that were implemented:
- **CREATE** — POST endpoint returns `{ success: true }`
- **READ** — GET endpoint returns the row
- **UPDATE** — PUT/PATCH endpoint updates correctly
- **DELETE** — DELETE endpoint removes the row

### Step 3 — Report result
Output a checklist before cleanup:
```
✅ CREATE — POST /api/forum → { success: true }
✅ READ   — GET /api/forum → returns post with user
✅ REPLY  — POST /api/forum/:id/reply → { success: true }
```

### Step 4 — Delete test rows (MANDATORY)
After confirming success, delete ALL test data:
```bash
wrangler d1 execute fullstack-builder-db --remote --command="DELETE FROM <table> WHERE id='test-xxx'"
```

**Never leave test rows in the production database.**

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
