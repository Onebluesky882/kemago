# GoverAgent — AI Software Factory

> **Your private AI software company.**
> Build production-ready software by chatting with AI. No coding. No hiring. No setup.

Live: [gover-agent-web.onebluesky882.workers.dev](https://gover-agent-web.onebluesky882.workers.dev)

---

## What is GoverAgent?

GoverAgent is not a starter kit — it is an **AI Software Factory**.

Instead of hiring a team, you have one AI that plays every role:

| Role | Handled by |
|------|-----------|
| Product Manager | AI Conductor |
| UI Designer | AI Worker |
| Frontend Developer | AI Worker |
| Backend Developer | AI Worker |
| DevOps | AI Worker |
| QA | AI Worker |

Customers describe what they want in plain language. The AI builds, deploys, and maintains the full application — automatically.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + OpenNext |
| Backend | Hono on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM |
| Auth | Better Auth |
| Storage | Cloudflare R2 (presigned URLs) |
| Email | Resend |
| Payment | Stripe |
| Deploy | Cloudflare Workers + Wrangler |
| Package manager | pnpm (monorepo) |
| Build | Turborepo |
| Linting | Biome |
| Language | TypeScript (strict) |

---

## Project Structure

```
apps/
  web/          Next.js — public site (landing, pricing, onboarding, auth)
  admin/        Next.js — admin dashboard (users, storage, emails, settings)
  api/          Hono — Cloudflare Worker (all API domains)

packages/
  auth/         Better Auth config + client
  db/           Drizzle schema + D1 client + migrations
  email/        Resend templates (welcome, reset, notification)
  ui/           Shared React components
  config/       Shared tsconfig + Biome config

agentic/        AI governance system (Conductor + Worker workflow)
  PIPELINE.md   Stage definitions and status
  CONDUCTOR.md  Conductor rules and deploy checklist
  CUSTOMER_SETUP.md  Customer onboarding rules (R2, Stripe, Resend, GitHub)
  DESIGN_SYSTEM.md   UI/animation standards
  START_HERE.md Worker mandatory entry point
  tasks/        Stage dispatch files
  gate-out/     Worker completion reports
  merge-approval/ Conductor approval files
```

---

## API Domains

| Route | Domain |
|-------|--------|
| `GET /health` | Health check |
| `POST /api/auth/*` | Better Auth (signup, signin, signout) |
| `GET /api/user/me` | Current session user |
| `POST /api/email/welcome` | Send welcome email (Resend) |
| `POST /api/email/notify` | Send notification email |
| `POST /api/storage/presign/upload` | R2 presigned upload URL |
| `POST /api/storage/presign/download` | R2 presigned download URL |
| `GET /api/storage/files` | List files in R2 bucket |
| `DELETE /api/storage/file` | Delete file from R2 |
| `GET /api/payment/config` | Stripe publishable key |
| `POST /api/payment/intent` | Create payment intent |
| `POST /api/payment/checkout` | Create Stripe checkout session |
| `POST /api/payment/webhook` | Stripe webhook handler |

---

## Frontend Architecture

All frontend apps follow a strict 4-layer pattern:

```
components/   Pure UI — props only, no business logic, no store access
hooks/        Business logic + local state + fetch calls
store/        Zustand global state (auth.store, ui.store)
app/page.tsx  Orchestrates hook + components, passes props
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Wrangler CLI (`npm i -g wrangler`)
- Cloudflare account (free)

### 1. Clone and install

```bash
git clone https://github.com/Onebluesky882/goveragent.git
cd goveragent
pnpm install
```

### 2. Wrangler login

```bash
wrangler login
wrangler whoami   # verify
```

### 3. Create D1 database

```bash
wrangler d1 create gover-agent-db
# Copy the database_id into apps/api/wrangler.toml
```

### 4. Run database migration

```bash
wrangler d1 execute gover-agent-db --remote --file packages/db/migrations/auth.sql
# Verify:
wrangler d1 execute gover-agent-db --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### 5. Create R2 bucket

```bash
wrangler r2 bucket create gover-agent-storage
```

### 6. Set environment variables

Copy `.dev.vars.example` to `apps/api/.dev.vars` and fill in:

```env
RESEND_API_KEY=your_resend_api_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=gover-agent-storage
```

Set R2 credentials as Wrangler secrets (production):

```bash
echo "<value>" | wrangler secret put R2_ACCESS_KEY_ID
echo "<value>" | wrangler secret put R2_SECRET_ACCESS_KEY
```

### 7. Set frontend API URL

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=https://your-api.workers.dev

# apps/admin/.env.local
NEXT_PUBLIC_API_URL=https://your-api.workers.dev
```

### 8. Deploy

```bash
# API
cd apps/api && wrangler deploy

# Web
cd apps/web && opennextjs-cloudflare build && wrangler deploy

# Admin
cd apps/admin && pnpm cf-build && wrangler deploy
```

---

## Agentic Workflow

GoverAgent uses a **Conductor / Worker** multi-agent system.

```
Dev  →  sets project direction
Conductor  →  orchestrates stages, dispatches workers, validates gate-outs, deploys
Workers  →  execute one assigned stage each, in their own domain
```

### Authority order

```
Dev > Conductor > Workers
```

### After every feature completion, Conductor MUST:

```bash
pnpm test
cd apps/api && wrangler deploy
cd apps/web && opennextjs-cloudflare build && wrangler deploy
cd apps/admin && pnpm cf-build && wrangler deploy
```

All three deploys must succeed before merge-approval is written.

### Pipeline status

| Stage | Domain | Status |
|-------|--------|--------|
| stage-1-setup | monorepo, config, deploy | ✅ COMPLETE |
| stage-2-auth | Better Auth, session, DB schema | ✅ COMPLETE |
| stage-3-api-core | Hono domain structure | ✅ COMPLETE |
| stage-4-email | Resend templates | ✅ COMPLETE |
| stage-5-storage | R2 presigned URLs | ✅ COMPLETE |
| stage-6-payment | Stripe payment + webhook | ✅ COMPLETE |
| stage-7-web-ui | Landing, pricing, onboarding, auth | ✅ COMPLETE |
| stage-8-admin-ui | Dashboard, users, storage, emails | ✅ COMPLETE |
| stage-9-customer | Customer onboarding flow | ✅ COMPLETE |
| stage-10-tests | Vitest unit + integration tests | ✅ COMPLETE |
| stage-11-docs | README, developer guide, .dev.vars | ✅ COMPLETE |
| stage-12-ai-agent-setup | Anthropic Managed Agents backend | ✅ COMPLETE |
| stage-13-ai-agent-chat | Admin UI chat interface | ✅ COMPLETE |
| stage-14-ai-agent-deploy | Deploy status tracking | ✅ COMPLETE |
| stage-15-observability | Structured logging, admin log table | ✅ COMPLETE |

---

## Developer Guide — Extending the Template

### Adding a new API domain

Each domain follows this structure:

```
apps/api/src/domains/<name>/
  <name>.schema.ts   — Zod request/response schemas
  <name>.handler.ts  — business logic functions
  <name>.route.ts    — Hono router, auth guard, mount here
```

**Steps:**

1. Create the domain folder and 3 files above
2. Mount the router in `apps/api/src/index.ts`:
   ```ts
   import { myRouter } from './domains/my-domain/my-domain.route'
   app.route('/api/my-domain', myRouter)
   ```
3. Add the binding type to `Bindings` in `index.ts` if new env vars are needed
4. Create migration in `packages/db/migrations/<name>.sql` and apply:
   ```bash
   wrangler d1 execute <db-name> --remote --file packages/db/migrations/<name>.sql
   ```

### Adding a new admin page

```
apps/admin/app/(dashboard)/<page>/
  page.tsx          — React page component
```

Add the route to `NAV_LINKS` in `apps/admin/app/(dashboard)/layout.tsx`.

Pattern to follow: every page uses a `use-<page>.ts` hook for data fetching, and `components/<page>/` for UI components.

### Set owner after first deploy

After deploying and signing up with your owner email:

```bash
pnpm set-owner --email your@email.com
# or for local D1:
pnpm set-owner --email your@email.com --local
```

### Environment variables

Copy `apps/api/.dev.vars.example` → `apps/api/.dev.vars` and fill in all values before running locally.

---

## Customer Onboarding

When a customer purchases GoverAgent, the Conductor guides them through:

1. **Wrangler login** — verify Cloudflare account before any deploy
2. **GitHub account** — required to receive their customized app
3. **R2 storage** (optional) — guide to create API token in Cloudflare dashboard
4. **Resend email** (optional) — guide to sign up and get API key
5. **Stripe payments** (optional) — guide to get publishable + secret keys
6. **Setup questions** — plain-language questions about their business (no tech jargon)

All customer interactions use `agentic/CUSTOMER_SETUP.md` as the script.

---

## Governance Files

All governance files live in `agentic/`. Workers read them but cannot modify them.

| File | Owner | Purpose |
|------|-------|---------|
| `QUESTIONS.md` | Dev | Project setup questionnaire |
| `GOVERNANCE_CORE.md` | Dev | File ownership, reading order, authority |
| `PROJECT.md` | Conductor | Project identity and status |
| `PIPELINE.md` | Conductor | Stage list, status, acceptance criteria |
| `CONDUCTOR.md` | Conductor | Conductor role, deploy checklist, migration rules |
| `CUSTOMER_SETUP.md` | Conductor | Customer onboarding script (R2, Stripe, Resend) |
| `DESIGN_SYSTEM.md` | Conductor | UI rules, animation standards, mobile-first |
| `ARCHITECTURE.md` | Conductor | System architecture and modules |
| `AGENT_RULES.md` | Conductor | Full workflow rules and gate-out template |
| `SECURITY_RULES.md` | Conductor | Mandatory security requirements |
| `START_HERE.md` | Worker | Mandatory worker entry point |
| `DECISIONS.md` | Conductor | Tech stack decisions |

---

## Deployed URLs

| App | URL |
|-----|-----|
| Web | https://gover-agent-web.onebluesky882.workers.dev |
| Admin | https://gover-agent-admin.onebluesky882.workers.dev |
| API | https://gover-agent-api.onebluesky882.workers.dev |

---

## Pricing

| Plan | Projects | Price |
|------|---------|-------|
| Starter | 1 | $49 one-time |
| Pro | 3 | $119 one-time |
| Business | 10 | $299 one-time |

Free hosting on Cloudflare — 100,000 req/day · 5GB D1 · 10GB R2.

Developer consultation available at $100/hr → [contact](https://gover-agent-web.onebluesky882.workers.dev/contact)
