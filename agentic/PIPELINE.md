# PIPELINE.md

Status: ACTIVE
Owner: CONDUCTOR
Conductor Branch: main

---

## Stage Overview

| Stage | Domain | Depends On | Status |
|-------|--------|------------|--------|
| stage-1-setup | monorepo, config, deploy | none | COMPLETE |
| stage-2-auth | Better Auth, session, DB schema | stage-1-setup | COMPLETE |
| stage-3-api-core | Hono domain structure, user/auth/email/storage routes | stage-2-auth | COMPLETE |
| stage-4-email | Resend, email templates, notification system | stage-3-api-core | COMPLETE |
| stage-5-storage | Cloudflare R2 presigned URL, upload/download/delete | stage-3-api-core | COMPLETE |
| stage-6-payment | Stripe payment intent, checkout session, webhook | stage-3-api-core | COMPLETE |
| stage-7-web-ui | Next.js public site, landing page, onboarding setup page | stage-3-api-core | COMPLETE |
| stage-8-admin-ui | Admin dashboard with real data, protected routes | stage-2-auth, stage-5-storage, stage-4-email | COMPLETE |
| stage-9-customer | CUSTOMER_SETUP flow wired into Conductor | stage-7-web-ui, stage-8-admin-ui | COMPLETE |
| stage-10-tests | Vitest unit + integration tests all apps | stage-9-customer | COMPLETE |
| stage-11-docs | README, customer guide, how to use with Conductor | stage-10-tests | COMPLETE |
| stage-12-ai-agent-setup | Anthropic Managed Agents backend — vault, session, SSE stream, D1 table | stage-2-auth, stage-3-api-core | COMPLETE |
| stage-13-ai-agent-chat | Admin UI — GitHub repo connect, chat interface, SSE streaming display | stage-12-ai-agent-setup, stage-8-admin-ui | COMPLETE |
| stage-14-ai-agent-deploy | Deploy status tracking — Cloudflare auto-deploy after Claude git push | stage-13-ai-agent-chat | COMPLETE |
| stage-15-observability | Structured logging for all agent calls — D1 agent_logs, correlation_id, admin dashboard | stage-12-ai-agent-setup | COMPLETE |

**Parallel stages:**
- stage-7-web-ui, stage-8-admin-ui ran in parallel (no overlapping dependencies)
- stage-9-customer, stage-12-ai-agent-setup MUST run in parallel (both ready now — stage-8 and stage-3 are COMPLETE, no dependency between them)

---

## Stage Detail

### stage-1-setup — Monorepo Setup

**Domain:** root, apps/*, packages/*
**Depends On:** none
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] pnpm monorepo with Turborepo configured
- [x] Biome linting + formatting configured
- [x] TypeScript strict mode, shared tsconfig in packages/config
- [x] apps/web, apps/admin, apps/api scaffolded
- [x] packages/ui, packages/db, packages/auth, packages/email, packages/config created
- [x] All three apps deployed to Cloudflare Workers

**Dispatch-In:** `tasks/stage-1-setup.md`
**Gate-Out:** `gate-out/stage-1-setup.md`
**Merge-Approval:** `merge-approval/stage-1-setup.md`

---

### stage-2-auth — Authentication

**Domain:** packages/auth, packages/db, apps/api/domains/auth, apps/web, apps/admin
**Depends On:** stage-1-setup
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Better Auth configured with Drizzle adapter + D1
- [x] DB schema: user, session, account, verification tables
- [x] /api/auth/* routes mounted in Hono
- [x] Login + register pages in apps/web and apps/admin
- [x] useAuth() hook — signIn, signUp, signOut
- [x] useSession() hook — global session state via Zustand
- [x] store/auth.store.ts, store/ui.store.ts created
- [x] QueryProvider wrapping both apps

**Dispatch-In:** `tasks/stage-2-auth.md`
**Gate-Out:** `gate-out/stage-2-auth.md`
**Merge-Approval:** `merge-approval/stage-2-auth.md`

---

### stage-3-api-core — API Domain Structure

**Domain:** apps/api/src/domains
**Depends On:** stage-2-auth
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Domain folder structure: auth, user, health, email, storage
- [x] Each domain has route.ts, handler.ts, schema.ts
- [x] CORS middleware configured
- [x] /api/user/me — returns current session user
- [x] /health — health check endpoint

**Dispatch-In:** `tasks/stage-3-api-core.md`
**Gate-Out:** `gate-out/stage-3-api-core.md`
**Merge-Approval:** `merge-approval/stage-3-api-core.md`

---

### stage-4-email — Email Notification System

**Domain:** packages/email, apps/api/src/domains/email
**Depends On:** stage-3-api-core
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Resend client configured via RESEND_API_KEY env var
- [x] Templates: WelcomeEmail, ResetPasswordEmail, NotificationEmail
- [x] /api/email/welcome — send welcome email
- [x] /api/email/notify — send custom notification
- [x] .dev.vars with RESEND_API_KEY placeholder
- [x] CUSTOMER_SETUP.md includes Resend onboarding rule

**Dispatch-In:** `tasks/stage-4-email.md`
**Gate-Out:** `gate-out/stage-4-email.md`
**Merge-Approval:** `merge-approval/stage-4-email.md`

---

### stage-5-storage — File Storage (R2 Presigned URLs)

**Domain:** apps/api/src/domains/storage
**Depends On:** stage-3-api-core
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Cloudflare R2 bucket created (gover-agent-storage)
- [x] Presigned URL upload — client uploads directly to R2, server never handles file data
- [x] Presigned URL download — client downloads directly from R2
- [x] DELETE /api/storage/file — delete file from R2
- [x] GET /api/storage/files — list files with optional prefix filter
- [x] R2 credentials (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) via .dev.vars
- [x] @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner installed

**Dispatch-In:** `tasks/stage-5-storage.md`
**Gate-Out:** `gate-out/stage-5-storage.md`
**Merge-Approval:** `merge-approval/stage-5-storage.md`

---

### stage-6-payment — Stripe Payment Integration

**Domain:** apps/api/src/domains/payment
**Depends On:** stage-3-api-core
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Stripe SDK installed (stripe package)
- [x] POST /api/payment/intent — create PaymentIntent, returns clientSecret
- [x] POST /api/payment/checkout — create hosted Checkout Session, returns URL
- [x] POST /api/payment/webhook — verify Stripe signature, handle payment_intent.succeeded + checkout.session.completed
- [x] GET /api/payment/config — return publishable key (safe for frontend)
- [x] STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET via .dev.vars
- [x] wrangler.toml vars include Stripe key placeholders

**Dispatch-In:** `tasks/stage-6-payment.md`
**Gate-Out:** `gate-out/stage-6-payment.md`
**Merge-Approval:** `merge-approval/stage-6-payment.md`

---

### stage-7-web-ui — Public Website UI

**Domain:** apps/web
**Depends On:** stage-3-api-core
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Landing page — explains what the starter kit is, CTA button
- [x] Onboarding setup page — interactive CUSTOMER_SETUP questions (go-blueprint.dev style)
- [x] Login page — functional, connected to /api/auth
- [x] Register page — functional, connected to /api/auth
- [x] Responsive layout
- [x] SEO metadata configured

**Dispatch-In:** `tasks/stage-7-web-ui.md`
**Gate-Out:** `gate-out/stage-7-web-ui.md`
**Merge-Approval:** `merge-approval/stage-7-web-ui.md`

---

### stage-8-admin-ui — Admin Dashboard (Real Data)

**Domain:** apps/admin
**Depends On:** stage-2-auth, stage-4-email, stage-5-storage
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [x] Dashboard protected — redirect to /login if no session
- [x] Users page — real data from /api/user
- [x] Storage page — list files from /api/storage/files, upload via presigned URL
- [x] Emails page — email send log (real data)
- [x] Settings page — update user profile, change password
- [x] Sidebar navigation functional with ui.store (open/close)

**Dispatch-In:** `tasks/stage-8-admin-ui.md`
**Gate-Out:** `gate-out/stage-8-admin-ui.md`
**Merge-Approval:** `merge-approval/stage-8-admin-ui.md`

---

### stage-9-customer — Customer Onboarding Flow

**Domain:** agentic/CUSTOMER_SETUP.md, apps/web onboarding page
**Depends On:** stage-7-web-ui, stage-8-admin-ui
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [ ] Conductor reads CUSTOMER_SETUP.md before starting any customer project
- [ ] Wrangler login check runs before any deploy
- [ ] GitHub account check runs before any code delivery
- [ ] Resend onboarding rule: ask customer, guide signup if needed
- [ ] Onboarding setup page (apps/web) matches CUSTOMER_SETUP.md questions
- [ ] Conductor maps customer answers to PIPELINE.md stages

**Dispatch-In:** `tasks/stage-9-customer.md`
**Gate-Out:** `gate-out/stage-9-customer.md`
**Merge-Approval:** `merge-approval/stage-9-customer.md`

---

### stage-10-tests — Test Suite

**Domain:** apps/*, packages/*
**Depends On:** stage-9-customer
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [ ] Vitest configured in all apps and packages
- [ ] Unit tests: auth handlers, storage handlers, email handlers, payment handlers
- [ ] Integration test: /health endpoint returns 200
- [ ] Integration test: /api/auth/sign-up creates user in D1
- [ ] All tests pass: pnpm test exits 0

**Dispatch-In:** `tasks/stage-10-tests.md`
**Gate-Out:** `gate-out/stage-10-tests.md`
**Merge-Approval:** `merge-approval/stage-10-tests.md`

---

### stage-11-docs — Documentation

**Domain:** README.md, agentic/
**Depends On:** stage-10-tests
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [ ] README.md — what this starter kit is, who it's for, how to use it
- [ ] Customer guide — how to talk to Conductor, what to expect
- [ ] Developer guide — how to extend the template, add new domains
- [ ] Environment variables documented (.dev.vars.example)
- [ ] Deployed URLs documented

**Dispatch-In:** `tasks/stage-11-docs.md`
**Gate-Out:** `gate-out/stage-11-docs.md`
**Merge-Approval:** `merge-approval/stage-11-docs.md`

---

### stage-12-ai-agent-setup — Anthropic Managed Agents Backend

**Domain:** apps/api/src/domains/agent, packages/db/migrations, apps/api/wrangler.toml, scripts/
**Depends On:** stage-2-auth, stage-3-api-core
**Status:** `COMPLETE`
**Parallel with:** stage-9-customer (no shared dependencies)

**Acceptance Criteria:**
- [ ] `@anthropic-ai/sdk` installed in apps/api — verify version with `npm info @anthropic-ai/sdk version`
- [ ] `scripts/setup-anthropic-agent.ts` — one-time script: creates Anthropic Environment + Agent, prints IDs
- [ ] `apps/api/src/domains/agent/agent.schema.ts` — Zod schemas for all request bodies
- [ ] `apps/api/src/domains/agent/agent.handler.ts` — Anthropic SDK calls (vault, session, stream, files)
- [ ] `apps/api/src/domains/agent/agent.route.ts` — all routes registered, auth guard on every route
- [ ] `apps/api/src/index.ts` — agentRouter mounted at `/api/agent`
- [ ] `apps/api/wrangler.toml` — ANTHROPIC_API_KEY, ANTHROPIC_AGENT_ID, ANTHROPIC_ENV_ID added as secrets comments
- [ ] `packages/db/migrations/agent.sql` — agent_sessions table created and applied to D1
- [ ] All routes respond correctly: vault, session, message, stream, files, file/:id, deploy-notify, deploy-complete, deploy-status
- [ ] Auth guard returns 401 if no session on all routes (except deploy-complete which uses DEPLOY_WEBHOOK_SECRET)
- [ ] `pnpm type-check` exits 0

**Routes to implement:**
- `POST /api/agent/vault` — create Anthropic Vault, store GitHub PAT, save vault_id to D1
- `POST /api/agent/session` — create Managed Agents session with github_repository resource
- `POST /api/agent/message` — send user.message event to session
- `GET  /api/agent/stream` — SSE stream: proxy sessions.events.stream() to browser
- `GET  /api/agent/files` — list files Claude wrote to session outputs

**D1 table: agent_sessions**
```sql
id TEXT PRIMARY KEY,
user_id TEXT NOT NULL,
session_id TEXT NOT NULL,
vault_id TEXT NOT NULL,
github_repo_url TEXT NOT NULL,
status TEXT NOT NULL DEFAULT 'active',
created_at INTEGER NOT NULL
```

**Dispatch-In:** `tasks/stage-12-ai-agent-setup.md`
**Gate-Out:** `gate-out/stage-12-ai-agent-setup.md`
**Merge-Approval:** `merge-approval/stage-12-ai-agent-setup.md`

---

### stage-13-ai-agent-chat — Admin UI Chat Interface

**Domain:** apps/admin/src/app/agent
**Depends On:** stage-12-ai-agent-setup, stage-8-admin-ui
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [ ] `/agent` page in apps/admin — protected route (redirect to /login if no session)
- [ ] GitHub repo URL + PAT input form — calls POST /api/agent/vault
- [ ] Chat input + message history display
- [ ] SSE streaming — EventSource connects to GET /api/agent/stream, renders text as it arrives
- [ ] Tool use indicator — shows "Claude is editing files..." when agent.tool_use event received
- [ ] Download files button — calls GET /api/agent/files, triggers download
- [ ] Back button — router.back() per CLAUDE.md navigation rules
- [ ] No emoji in UI — SVG icons only per CLAUDE.md icons rule
- [ ] No `<a href>` for internal links — Link or router.push only

**Dispatch-In:** `tasks/stage-13-ai-agent-chat.md`
**Gate-Out:** `gate-out/stage-13-ai-agent-chat.md`
**Merge-Approval:** `merge-approval/stage-13-ai-agent-chat.md`

---

### stage-14-ai-agent-deploy — Deploy Status Tracking

**Domain:** apps/api/src/domains/agent (extend), apps/admin/src/app/agent (extend)
**Depends On:** stage-13-ai-agent-chat
**Status:** `COMPLETE`

**Acceptance Criteria:**
- [ ] After Claude git push — detect push via session events
- [ ] POST /api/agent/deploy-status — update D1 record with deploy state
- [ ] GET /api/agent/deploy-status — return current deploy state for session
- [ ] Admin UI shows deploy progress: "Pushing to GitHub... → Cloudflare deploying... → Live"
- [ ] Cloudflare webhook (optional) — receive deploy completion signal

**Dispatch-In:** `tasks/stage-14-ai-agent-deploy.md`
**Gate-Out:** `gate-out/stage-14-ai-agent-deploy.md`
**Merge-Approval:** `merge-approval/stage-14-ai-agent-deploy.md`

---

### stage-15-observability — Structured Logging for Agent Calls

**Domain:** packages/db/migrations, apps/api/src/domains/agent, apps/admin/app/(dashboard)/observability
**Depends On:** stage-12-ai-agent-setup
**Status:** `COMPLETE`
**Parallel with:** stage-14-ai-agent-deploy (no shared dependencies)

**Acceptance Criteria:**
- [ ] `packages/db/migrations/observability.sql` — `agent_logs` table created and applied
- [ ] `correlation_id` middleware added to Hono — generates UUID per request, attaches to context
- [ ] `agent.route.ts` updated — writes to `agent_logs` after every SSE stream completes
- [ ] Log captures: correlation_id, user_id, session_id, agent_id, input_preview (300 chars), output_preview (300 chars), tool_calls (JSON), tokens_input, tokens_output, latency_ms, status, error_message
- [ ] Token counts read from `span.model_request_end` event during SSE stream
- [ ] Tool names collected from `agent.tool_use` events during SSE stream
- [ ] `GET /api/agent/logs` — returns recent logs for the authenticated user
- [ ] `apps/admin/app/(dashboard)/observability/page.tsx` — shows log table: latency, tokens, status, tools per run
- [ ] No full user messages or agent responses logged (300-char preview only)
- [ ] No secrets logged
- [ ] `pnpm type-check` exits 0

**SQL schema:**
```sql
CREATE TABLE IF NOT EXISTS agent_logs (
  id TEXT PRIMARY KEY,
  correlation_id TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT,
  agent_id TEXT,
  input_preview TEXT,
  output_preview TEXT,
  tool_calls TEXT,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_logs_user ON agent_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_correlation ON agent_logs(correlation_id);
```

**Dispatch-In:** `tasks/stage-15-observability.md`
**Gate-Out:** `gate-out/stage-15-observability.md`
**Merge-Approval:** `merge-approval/stage-15-observability.md`

---

## Deploy Checklist (run after every stage)

```bash
pnpm test
cd apps/api && wrangler deploy
cd apps/web && opennextjs-cloudflare build && wrangler deploy
cd apps/admin && opennextjs-cloudflare build && wrangler deploy
```

All three must succeed before Conductor writes merge-approval.
