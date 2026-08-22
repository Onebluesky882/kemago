# DEV_LOG.md

Status: ACTIVE

Owner: DEV

⸻

Purpose

This file records every direct edit Dev makes to governance files or code.

Conductor must read this file regularly and reconcile ROADMAP.md, PROJECT.md, and PIPELINE.md based on new entries.

⸻

Entry Format

Date: YYYY-MM-DD
File(s) changed: <path(s)>
Reason: <why Dev made this change>
Impact: <what Conductor/Workers should know or update because of this>

⸻

Log

<!-- Add newest entries at the top -->

Date: 2026-08-23
File(s) changed: PROJECT.md, DECISIONS.md, ARCHITECTURE.md, CONTRACTS.md, PIPELINE.md, ROADMAP.md
Reason: Ran through QUESTIONS.md with the developer (Thai-language session) to configure this template for the Coarea project.
Impact: `<conductor-branch>` replaced with `main` everywhere. Project defined: Coarea, a local-first social app (Feed, Events, Profile, Chat), mobile-first (Expo/React Native + TypeScript). Backend deliberately deviates from template default: Go instead of Hono/Cloudflare Workers, self-hosted via OrbStack instead of Cloudflare, PostgreSQL instead of D1 — see DECISIONS.md → Coarea Tech Stack for full rationale and consequences. `apps/web`/`apps/admin` deprioritized until client asks. PIPELINE.md now has stage-4 through stage-10 planned (backend scaffold, auth, mobile shell, feed, event, profile, chat). Conductor should dispatch stage-4-backend-scaffold and stage-6-mobile-shell next (parallel-safe, no shared files).
