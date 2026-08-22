# ARCHITECTURE.md

## Overview

Coarea is a local-first social app. The first release is a mobile app (`apps/mobile`, React Native / Expo + TypeScript) talking to a self-hosted Go backend over a Bearer-token-authenticated REST API. `apps/web` and `apps/admin` exist in the monorepo template but are out of scope until the mobile app ships.

## Modules / Components

| Module | Domain | Responsibility |
|---|---|---|
| Feed | `apps/mobile` (screen), backend `feed` domain | Local news/story feed — browse and post local updates |
| Event / Mission | `apps/mobile` (screen), backend `event` domain | Browse, create, and join local events/missions |
| Profile | `apps/mobile` (screen), backend `user` domain | User profile, account settings |
| Chat | `apps/mobile` (screen), backend `chat` domain | Direct/community messaging between users |
| Auth | `apps/mobile`, backend `auth` domain | Registration, login, Bearer token issuance/validation (Go-native, not `packages/auth`) |
| Backend API | new Go service (location TBD, not yet scaffolded) | REST API serving Feed, Event, Profile, Chat, Auth |
| Database | PostgreSQL (OrbStack container) | Persistence for all backend domains |

## Data Flow

Mobile app → HTTPS REST calls (`Authorization: Bearer <token>`) → Go backend API → PostgreSQL.

No Cloudflare Workers, D1, or `packages/auth` are in this data path (see DECISIONS.md → Coarea Tech Stack).

## External Dependencies

- PostgreSQL (self-hosted, OrbStack container)
- Expo / EAS (mobile build + app store distribution)
- OrbStack (local container runtime, replaces Cloudflare Workers as the backend host)

⸻

## Constraints

- Backend must not depend on Cloudflare Workers bindings (D1, KV, R2) — it runs outside the Workers runtime
- Auth must be Bearer-token based, no cookies (per SECURITY_RULES.md — Session & Cookie Removal, still applies even though the implementation is Go-native, not `packages/auth`)
- `apps/web` and `apps/admin` must not be built out or deployed until the client explicitly asks (see DECISIONS.md)
- Mobile app is the priority deliverable; backend work should be scoped to what the mobile screens (Feed, Event, Profile, Chat) need
