# Agent Rules

## Scope Discipline — Do Only What Was Asked

Never do more than what the user explicitly requested.

- If asked to create a **mock UI** → create only UI files. Do not create API routes, DB schemas, hooks, or any backend code.
- If asked to create an **API endpoint** → create only that endpoint. Do not create frontend pages or hooks.
- If asked to **fix a bug** → fix only that bug. Do not refactor surrounding code.

When in doubt, do less and ask. It is always better to ask than to add unrequested files.

---

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

> "Do you have a reference website you'd like the design to resemble?"

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

### 3. Run database migrations

Run every file in `packages/db/migrations/` — **in this exact order** (later files `ALTER TABLE` columns onto tables created by earlier ones; running out of order fails):

```bash
cd packages/db/migrations
for f in auth.sql auth-role.sql forum.sql forum_category.sql forum_image_url.sql \
         forum_nested_reply.sql forum_pin.sql forum_post_number.sql forum_status.sql \
         roadmap.sql observability.sql agent.sql agent-cost.sql agent-deploy.sql \
         purchases.sql purchases_plan.sql setup.sql; do
  wrangler d1 execute YOUR_APP_NAME-db --remote --file "$f"
done
```

If a new migration file is added later, append it to the end of this list (or earlier, right after the base table it alters) — never just glob `*.sql`, since alphabetical order does not match dependency order here (e.g. `agent-cost.sql` sorts before `observability.sql`, which creates the table it alters).

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
| Telegram bot | `/webhook/telegram`, `/webhook/notify` | new Telegram integration |
| Discord bot | `/api/discord/interactions`, `/api/discord/notify` | new Discord integration |
| Crypto payments | `/api/nowpayments` (NOWPayments) | new crypto payment logic |

If a service listed above doesn't fit the client's need, extend it — never replace it.

---

## Pipeline & Roadmap Docs — Required on Every Commit

Two files in `agentic/` must exist and be updated in every commit.
The commit hook blocks any `git commit` that does not stage at least one of them.

| File | Audience | Language | Content |
|------|----------|----------|---------|
| `agentic/PIPELINE.md` | Conductor (AI / developer) | Technical English | What was done, how, what's next — implementation detail |
| `agentic/ROADMAP.md` | Client (human / business owner) | Plain English, no jargon | What the client now has, what's coming — outcome focused |

### PIPELINE.md — update the Stage Detail and status after every task

```md
### stage-N-slug
**Status:** IN_PROGRESS → COMPLETE
**Done:** What was implemented and how (technical detail OK here)
**Next:** What the next conductor should pick up
**Blockers:** Anything needing client input or external action
```

### ROADMAP.md — update "Current Progress" and "Next Steps" sections only

```md
## Current Progress
- Login and registration are working
- Payment system is connected
- Forum is live

## Next Steps
- Build the dashboard page
- Connect email notifications
```

**Rules:**
- `PIPELINE.md` — write as if handing off to another conductor mid-task
- `ROADMAP.md` — must be readable by a non-technical client; no code, no tech terms
- Both files are append-only — never delete previous entries, only add

### Cloudflare Workers — ROADMAP.md is NOT readable at runtime

`agentic/ROADMAP.md` is a repo file for humans — not served by the app.
Cloudflare Workers have no filesystem (`readFileSync` does not exist at runtime).

- **Never** use `readFileSync` or `fs` to read `.md` files inside a Worker
- The `/roadmap` page must fetch data from `GET /api/roadmap` (D1 database) — not from this file
- `ROADMAP.md` is updated by the conductor as a handoff doc; the live roadmap state lives in D1

---

## Roadmap — Must Be Updated After Every Feature

After completing any feature, the conductor **must** update the roadmap so the client can see progress in plain language. Use the API directly — do not modify database or code manually.

### When to update
- Feature/task completed → set status to `done`
- Currently in progress → set status to `in-progress`
- Not yet started → leave status as `planned`

### How to update (API call as owner)

```bash
# Update task status
curl -X PATCH https://YOUR_APP_NAME-api.workers.dev/api/roadmap/tasks/<task_id> \
  -H "Authorization: Bearer <owner_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'

# Update phase status
curl -X PATCH https://YOUR_APP_NAME-api.workers.dev/api/roadmap/phases/<phase_id> \
  -H "Authorization: Bearer <owner_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

### Language rules — plain language only, no tech jargon

Labels and descriptions must be written so the client understands without technical knowledge:

| ❌ Do not use | ✅ Use instead |
|--------------|--------------|
| `Deploy API to Cloudflare Workers` | `Backend server is live` |
| `Implement JWT auth middleware` | `Login and logout is ready` |
| `Setup D1 database migration` | `Database is ready` |
| `Integrate Stripe webhook` | `Payment system connected` |
| `Fix CORS on workers.dev` | `Fixed connection issue between frontend and backend` |

**Rule:** If the client cannot understand what was completed from the label alone, rewrite it.

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

> "Do you want to keep the Roadmap and Forum pages?"

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

---

## CORS — ALLOWED_ORIGINS Rule

The API backend runs on `fullstack-builder-api.onebluesky882.workers.dev`.

When setting `ALLOWED_ORIGINS` in `apps/api/wrangler.toml`, the conductor must add **only the client's frontend URLs** — nothing else.

```toml
# ✅ correct — client's web and admin frontends only
ALLOWED_ORIGINS = "https://client-web.workers.dev,https://client-admin.workers.dev"

# ❌ wrong — do not add unrelated domains, backend URLs, or wildcard
ALLOWED_ORIGINS = "https://fullstack-builder-api.onebluesky882.workers.dev"
ALLOWED_ORIGINS = "*"
```

**Rules:**
- Only `https://` frontend URLs that the client's users will open in a browser
- Separate multiple origins with a comma, no spaces
- Do not add the API domain itself
- Do not use `*` (wildcard) — it disables `credentials` support

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
