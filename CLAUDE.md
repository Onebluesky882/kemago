# Agent Rules

## File Location

Governance files live in `agentic/` only. Never create governance files at the project root.

Files allowed at root: `CLAUDE.md`, `README.md`, and code directories (`apps/`, `packages/`, config files).

---

## Client Type — ENFORCED BY HOOK

Before writing any code, `agentic/CLIENT_TYPE.md` must exist.

```bash
echo "DEVELOPER" > agentic/CLIENT_TYPE.md  # developer workflow
echo "CLIENT" > agentic/CLIENT_TYPE.md      # non-technical business owner
```

- **DEVELOPER** → follow `agentic/QUESTIONS.md`
- **CLIENT** → follow `agentic/CUSTOMER_SETUP.md` (plain language, no tech terms)

Ask first: *"Are you a developer or a business owner?"*

---

## Internal Navigation

Never use `<a href>` for internal links — it causes full page reload and loses auth state.

```ts
// static link
import Link from 'next/link'
<Link href="/forum">Forum</Link>

// programmatic
const router = useRouter()
router.push('/forum')
```

`<a>` is only for external URLs (`https://`) and email (`mailto:`).

---

## Cross-Domain Auth (workers.dev)

`workers.dev` subdomains cannot share cookies. Use Bearer token for all authenticated mutations.

```ts
// ❌ cookie won't reach API on different subdomain
fetch('/api/forum', { method: 'POST', credentials: 'include' })

// ✅ sends Authorization: Bearer <token>
const { apiFetch } = useApi()
apiFetch('/api/forum', { method: 'POST', body: JSON.stringify({}) })
```

`bearer()` plugin must be enabled in `packages/auth/src/auth.ts`.

---

## Secrets

Never commit API keys. Use Cloudflare secrets:

```bash
cd apps/api && wrangler secret put SECRET_NAME
```

If `wrangler deploy` shows `env.KEY ("")` → secret not set.

---

## Before Starting

Read `agentic/START_HERE.md` before any task. For UI work, also read `agentic/DESIGN_SYSTEM.md`.

---

## Navigation Rules

Every page except `/` must have a **back button** that returns to the previous page.

Every logo/brand name in the navbar must link to `/` (homepage).

```ts
// Back button — use router, not <a>
'use client'
import { useRouter } from 'next/navigation'

const router = useRouter()
<button onClick={() => router.back()}>← Back</button>

// Logo — always routes to homepage
import Link from 'next/link'
<Link href="/">YourApp</Link>
```

**Rules:**
- Logo click → always `router.push('/')` or `<Link href="/">`
- Every inner page (`/forum`, `/roadmap`, `/dashboard`, `/payment/*`, etc.) → must render a back button
- Back button uses `router.back()` — never hardcode a path unless the page has no logical parent

---

## Icons

Never use emoji in UI code. Use inline SVG only.

```tsx
// ❌ wrong
<span>💳</span>

// ✅ correct
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
  <rect x="2" y="5" width="20" height="14" rx="2" />
  <line x1="2" y1="10" x2="22" y2="10" />
</svg>
```

---

## Design — Ask Before Building

Before writing any UI code, ask the client:

> "มีเว็บไซต์ที่อยากให้ design คล้ายๆ ไหม? (Do you have a reference website?)"

Do not start designing without a reference or explicit style direction.

---

## First-Deploy Checklist (Next.js + Cloudflare Workers)

When a conductor clones this template and deploys for the first time, complete these steps **in order** before handing off to the client:

### 1. Fill in `wrangler.toml` values
```toml
# apps/api/wrangler.toml
OWNER_EMAIL = "client@email.com"
ALLOWED_ORIGINS = "https://YOUR_APP_NAME-web.ACCOUNT.workers.dev,https://YOUR_APP_NAME-admin.ACCOUNT.workers.dev"
database_name = "YOUR_APP_NAME-db"
database_id = "<from: wrangler d1 create YOUR_APP_NAME-db>"
bucket_name = "<from: wrangler r2 bucket create YOUR_APP_NAME-storage>"
```

### 2. Set secrets
```bash
cd apps/api
wrangler secret put RESEND_API_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_PUBLISHABLE_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put ANTHROPIC_API_KEY
```

### 3. Run database migration
```bash
wrangler d1 execute YOUR_APP_NAME-db --remote --file ../../packages/db/migrations/auth.sql
```

### 4. Set `NEXT_PUBLIC_API_URL` in web + admin
```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=https://YOUR_APP_NAME-api.YOUR_ACCOUNT.workers.dev

# apps/admin/.env.local
NEXT_PUBLIC_API_URL=https://YOUR_APP_NAME-api.YOUR_ACCOUNT.workers.dev
```

### 5. Deploy
```bash
# from apps/web
pnpm deploy

# from apps/api
wrangler deploy
```

### 6. Use default services first — DO NOT rebuild what's already there

This template ships with fully working services. Before writing any new code, verify the existing ones work:

| Need | Already provided | Do NOT create |
|------|-----------------|---------------|
| Auth (login/register) | `POST /api/auth/login`, `POST /api/auth/register` | custom auth system |
| Session check | `GET /api/user/me` | new session endpoint |
| File upload | `/api/storage` | direct R2 integration |
| Email sending | `/api/email` | custom SMTP code |
| Payments | `/api/payment` (Stripe) | custom payment logic |
| AI agent | `/api/agent` (Anthropic) | new LLM wrapper |
| Forum/comments | `/api/forum` | new comments table |
| Roadmap/feedback | `/api/roadmap` | new feedback system |

If a service listed above doesn't fit the client's need, extend it — never replace it.

---

## Protected Files — Do NOT Modify

The following files are finalized and must not be edited by the conductor:

| File | Reason |
|------|--------|
| `apps/api/src/domains/forum/forum.route.ts` | Complete forum API — list, create, reply, status, notifications |
| `apps/api/src/domains/roadmap/roadmap.route.ts` | Complete roadmap API |

**Rule:** Do not modify logic, rename routes, remove endpoints, or refactor these files. If a new endpoint is needed, ask the client first. Bugs or security issues are the only exception — fix those, nothing else.

---

## Protected Pages — Do NOT Remove Without Client Approval

The following pages must remain in the project until the **client explicitly asks to remove them**:

- `/roadmap` — product roadmap / feedback collection
- `/forum` — community discussion

**Rule:** Never delete, comment out, or hide these pages on your own initiative. If you think they are unused, ask the client first:

> "คุณต้องการเก็บหน้า Roadmap และ Forum ไว้ไหมครับ?"

Only remove them after the client confirms in writing.

### 7. Smoke test — must pass before handoff
- [ ] `POST /api/auth/register` → returns `{ user, token }` (no error)
- [ ] `POST /api/auth/login` → returns `{ user, token }` (no error)
- [ ] `/dashboard` redirects to `/login` when not logged in
- [ ] Register form on web creates account and redirects to `/dashboard`
- [ ] Login form on web logs in and redirects to `/dashboard`

If any step fails, check `ALLOWED_ORIGINS` in `wrangler.toml` and redeploy.

---

## Default Scripts — Next.js + Cloudflare Workers (DO NOT MODIFY)

When the project uses **Next.js with Cloudflare Workers** (`opennextjs-cloudflare`), these scripts in `package.json` are the canonical defaults. The conductor must **never** modify them.

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "build:worker": "opennextjs-cloudflare build",
  "deploy": "opennextjs-cloudflare build && wrangler deploy",
  "start": "next start",
  "type-check": "tsc --noEmit",
  "test": "vitest run"
}
```

**Rules:**
- Do not rename, remove, or alter any of these script entries.
- Do not replace `opennextjs-cloudflare` with other adapters (e.g. `@cloudflare/next-on-pages`).
- If a new script is needed, add it — do not overwrite existing ones.

Detection: project has `opennextjs-cloudflare` in `package.json` dependencies or `wrangler.toml` present.

The `wrangler.toml` template is also a protected default — do not modify its structure:

```toml
name = "YOUR_APP_NAME-web"
main = ".open-next/worker.js"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"

[[d1_databases]]
binding = "DB"
database_name = ""
database_id = ""
```

**Rules:**
- `main`, `compatibility_date`, `compatibility_flags`, and `[assets].directory` must not be changed.
- `name`, `database_name`, and `database_id` are the only fields the client fills in — conductor must not prefill or hardcode them.
- Do not add or remove top-level sections (`[assets]`, `[[d1_databases]]`) unless explicitly instructed by the client.

---

## ADR Numbering

```bash
ls agentic/docs/adrs/ | sort | tail -3
```

Take the highest number + 1. File: `NNN-short-slug.md`.
