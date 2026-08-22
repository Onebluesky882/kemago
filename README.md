# Coarea

Coarea is a local-first social app that brings neighborhood news, community, and events into one place — helping people nearby meet, share stories, and take part in local activities together.

Built with a fullstack monorepo template that includes a built-in AI governance system (Conductor + Worker workflow).

---

## Who is this for?

General public in a given local area/neighborhood. The goal is broad, high-volume adoption — a mass consumer app, not a niche audience.

**First release:** a mobile app (`apps/mobile`) with four core areas — **Feed**, **Events**, **Profile**, and **Chat**.

---

## Tech Stack

Coarea deliberately deviates from this template's default Cloudflare/Hono stack — see `agentic/DECISIONS.md` → *Coarea Tech Stack* for full rationale.

| Layer | Technology |
|-------|-----------|
| Mobile app | React Native / Expo + TypeScript (`apps/mobile`) — priority deliverable |
| Backend | Go, self-hosted via OrbStack (containers) — not yet scaffolded |
| Database | PostgreSQL (OrbStack container) |
| Auth | Bearer token (JWT), implemented natively in Go — no cookies |
| Package manager | pnpm |
| Linting/Formatting | Biome (TypeScript/mobile); `gofmt` + `golangci-lint` (Go backend) |
| Testing | Vitest + Playwright (frontend); `go test` (backend) |
| State management | TanStack Query + Zustand (mobile) |

`apps/web` and `apps/admin` exist in the monorepo template but are **out of scope** until the mobile app ships.

---

## Project Structure

```
apps/
  mobile/       React Native / Expo — Feed, Events, Profile, Chat (priority)
  web/          Next.js — public site (deprioritized, out of scope for now)
  admin/        Next.js — admin dashboard (deprioritized, out of scope for now)
  api/          Hono — Cloudflare Worker template default (not used by Coarea's backend track)

packages/
  auth/           Better Auth config + client (Hono-based — does not apply to the Go backend)
  db/             Drizzle schema + D1 client + migrations (template default)
  email/          Resend templates (welcome, reset, notification)
  ui/             Shared React components
  config/         Shared tsconfig + Biome config
  chat-ops-core/  Chat-bot building blocks (Telegram, LINE, Meta webhooks + identity linking + command router + Groq NLP parsing) — no HTTP routes, import into any app/domain that needs a chat bot
  slip-verification-service/  Bank-slip/QR payment verification helper

agentic/        AI governance system (Conductor + Worker workflow)
  PROJECT.md          Project identity, goal, tech stack, status
  DECISIONS.md        Architecture decisions (incl. Coarea Tech Stack deviation)
  ARCHITECTURE.md     System architecture and modules
  CONTRACTS.md        API contracts (Auth, Feed, Event, Profile, Chat)
  PIPELINE.md         Stage definitions and status
  ROADMAP.md          Client-facing progress (plain language)
  QUESTIONS.md        Developer setup questionnaire
  CUSTOMER_SETUP.md   Business owner onboarding guide
  CONDUCTOR.md        Conductor orchestration rules
  DESIGN_SYSTEM.md    UI/animation standards
  START_HERE.md       Worker mandatory entry point
  tasks/              Stage dispatch files
  gate-out/           Worker completion reports
  merge-approval/     Conductor approval files
```

---

## Current Status

Greenfield project — setup complete, backend not yet scaffolded.

See `agentic/PIPELINE.md` for stage-by-stage status and `agentic/ROADMAP.md` for a plain-language progress summary.

---

## Quick Start (Developer)

### Prerequisites

- Node.js 18+
- pnpm
- Go (for backend work, once scaffolded)
- OrbStack (local container runtime for PostgreSQL + backend)
- Expo CLI / EAS (for mobile work)

### 1. Clone and install

```bash
git clone git@github.com:Onebluesky882/coarea.git
cd coarea
pnpm install
```

### 2. Governance setup

Project identity, tech stack, and stage plan are already answered and recorded in `agentic/PROJECT.md`, `agentic/DECISIONS.md`, and `agentic/PIPELINE.md`.

### 3. Backend (Go) — not yet scaffolded

The Go backend (self-hosted via OrbStack, PostgreSQL) has not been built yet. See `agentic/PIPELINE.md` → `stage-4-backend-scaffold` for the planned setup (module location, Postgres container, migrations, health check, CORS, lint/test tooling).

### 4. Mobile app (`apps/mobile`)

The Expo/React Native shell (Feed, Events, Profile, Chat tabs) has not been built yet. See `agentic/PIPELINE.md` → `stage-6-mobile-shell`.

---

## API Domains (planned)

The backend does not exist yet — these are the contracts defined for it in `agentic/CONTRACTS.md`, to be implemented in `stage-5-auth` through `stage-10-chat`.

| Route | Domain |
|-------|--------|
| `POST /v1/auth/register`, `POST /v1/auth/login` | Auth (Bearer/JWT) |
| `GET /v1/feed`, `POST /v1/feed` | Feed |
| `GET /v1/events`, `POST /v1/events`, `POST /v1/events/:id/join` | Event |
| `GET /v1/users/me`, `PATCH /v1/users/me` | Profile |
| `GET /v1/chats`, `GET /v1/chats/:id/messages`, `POST /v1/chats/:id/messages` | Chat |

---

## Extending the Project (Developer)

### Adding a new chat bot (Telegram, LINE, Meta/Messenger/Instagram)

`packages/chat-ops-core` already handles the platform-specific plumbing every
chat bot needs — webhook signature verification, message parsing, identity
linking, command routing, and Groq-based text parsing. Import it into a new
domain's route rather than writing webhook verification from scratch:

```ts
import { verifyLineWebhookSignature, extractLineMessages } from '@gover-agent/chat-ops-core'
```

See `packages/chat-ops-core/README.md` for full wiring examples per platform.

The `apps/api` (Hono/Cloudflare Workers), `apps/web`, and `apps/admin` template scaffolding is not part of Coarea's active backend track (see `agentic/DECISIONS.md` → *Coarea Tech Stack*) — extend the Go backend once `stage-4-backend-scaffold` lands instead.

---

## AI Governance System

This template uses a **Conductor / Worker** multi-agent workflow.

```
Dev        →  sets project direction
Conductor  →  orchestrates stages, dispatches workers, validates, deploys
Workers    →  execute one assigned stage each, in their own domain
```

**Authority order:** Dev > Conductor > Workers

All governance files live in `agentic/`. Read `agentic/START_HERE.md` before any task.

---

## Environment Variables

Not yet defined — the Go backend hasn't been scaffolded. Env vars for the PostgreSQL connection, JWT signing, and mobile API URL will be documented here once `stage-4-backend-scaffold` and `stage-6-mobile-shell` land. Never commit secrets or `.env` files.

Copy the `.example` files and fill in your values before running locally.
Never commit `.dev.vars` or `.env.local` files.
