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
| stage-6-web-ui | Next.js public site, landing page, onboarding setup page | stage-3-api-core | COMPLETE |
| stage-7-admin-ui | Admin dashboard with real data, protected routes | stage-2-auth, stage-5-storage, stage-4-email | COMPLETE |
| stage-8-customer | CUSTOMER_SETUP flow wired into Conductor | stage-6-web-ui, stage-7-admin-ui | PENDING |
| stage-9-tests | Vitest unit + integration tests all apps | stage-8-customer | PENDING |
| stage-10-docs | README, customer guide, how to use with Conductor | stage-9-tests | PENDING |

**Parallel stages:** stage-6-web-ui, stage-7-admin-ui can run in parallel (no overlapping dependencies)

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
- [x] Cloudflare R2 bucket created (fullstack-builder-storage)
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

### stage-6-web-ui — Public Website UI

**Domain:** apps/web
**Depends On:** stage-3-api-core
**Status:** `PENDING`

**Acceptance Criteria:**
- [ ] Landing page — explains what the starter kit is, CTA button
- [ ] Onboarding setup page — interactive CUSTOMER_SETUP questions (go-blueprint.dev style)
- [ ] Login page — functional, connected to /api/auth
- [ ] Register page — functional, connected to /api/auth
- [ ] Responsive layout
- [ ] SEO metadata configured

**Dispatch-In:** `tasks/stage-6-web-ui.md`
**Gate-Out:** `gate-out/stage-6-web-ui.md`
**Merge-Approval:** `merge-approval/stage-6-web-ui.md`

---

### stage-7-admin-ui — Admin Dashboard (Real Data)

**Domain:** apps/admin
**Depends On:** stage-2-auth, stage-4-email, stage-5-storage
**Status:** `PENDING`

**Acceptance Criteria:**
- [ ] Dashboard protected — redirect to /login if no session
- [ ] Users page — real data from /api/user
- [ ] Storage page — list files from /api/storage/files, upload via presigned URL
- [ ] Emails page — email send log (real data)
- [ ] Settings page — update user profile, change password
- [ ] Sidebar navigation functional with ui.store (open/close)

**Dispatch-In:** `tasks/stage-7-admin-ui.md`
**Gate-Out:** `gate-out/stage-7-admin-ui.md`
**Merge-Approval:** `merge-approval/stage-7-admin-ui.md`

---

### stage-8-customer — Customer Onboarding Flow

**Domain:** agentic/CUSTOMER_SETUP.md, apps/web onboarding page
**Depends On:** stage-6-web-ui, stage-7-admin-ui
**Status:** `PENDING`

**Acceptance Criteria:**
- [ ] Conductor reads CUSTOMER_SETUP.md before starting any customer project
- [ ] Wrangler login check runs before any deploy
- [ ] GitHub account check runs before any code delivery
- [ ] Resend onboarding rule: ask customer, guide signup if needed
- [ ] Onboarding setup page (apps/web) matches CUSTOMER_SETUP.md questions
- [ ] Conductor maps customer answers to PIPELINE.md stages

**Dispatch-In:** `tasks/stage-8-customer.md`
**Gate-Out:** `gate-out/stage-8-customer.md`
**Merge-Approval:** `merge-approval/stage-8-customer.md`

---

### stage-9-tests — Test Suite

**Domain:** apps/*, packages/*
**Depends On:** stage-8-customer
**Status:** `PENDING`

**Acceptance Criteria:**
- [ ] Vitest configured in all apps and packages
- [ ] Unit tests: auth handlers, storage handlers, email handlers
- [ ] Integration test: /health endpoint returns 200
- [ ] Integration test: /api/auth/sign-up creates user in D1
- [ ] All tests pass: pnpm test exits 0

**Dispatch-In:** `tasks/stage-9-tests.md`
**Gate-Out:** `gate-out/stage-9-tests.md`
**Merge-Approval:** `merge-approval/stage-9-tests.md`

---

### stage-10-docs — Documentation

**Domain:** README.md, agentic/
**Depends On:** stage-9-tests
**Status:** `PENDING`

**Acceptance Criteria:**
- [ ] README.md — what this starter kit is, who it's for, how to use it
- [ ] Customer guide — how to talk to Conductor, what to expect
- [ ] Developer guide — how to extend the template, add new domains
- [ ] Environment variables documented (.dev.vars.example)
- [ ] Deployed URLs documented

**Dispatch-In:** `tasks/stage-10-docs.md`
**Gate-Out:** `gate-out/stage-10-docs.md`
**Merge-Approval:** `merge-approval/stage-10-docs.md`

---

## Deploy Checklist (run after every stage)

```bash
pnpm test
cd apps/api && wrangler deploy
cd apps/web && opennextjs-cloudflare build && wrangler deploy
cd apps/admin && opennextjs-cloudflare build && wrangler deploy
```

All three must succeed before Conductor writes merge-approval.
