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

## ADR Numbering

```bash
ls agentic/docs/adrs/ | sort | tail -3
```

Take the highest number + 1. File: `NNN-short-slug.md`.
