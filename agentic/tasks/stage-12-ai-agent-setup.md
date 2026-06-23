stage-12-ai-agent-setup

Gate-In Verified: YES

---

## Assignment

**Stage:** stage-12-ai-agent-setup
**Domain:** apps/api/src/domains/agent, packages/db/migrations, apps/api/wrangler.toml, scripts/
**Branch:** stage/stage-12-ai-agent-setup
**Worktree:** .claude/worktrees/stage-12-ai-agent-setup/

---

## Objective

Add Anthropic Managed Agents backend to the API. Non-technical clients will use this to chat with Claude, which will read and edit their GitHub repository on their behalf. This stage covers backend only — no UI.

Client flow this enables:
1. Client enters GitHub repo URL + PAT → stored in Anthropic Vault
2. Client sends a message → session created with repo mounted at /workspace
3. Claude reads/edits files, commits, pushes via bash tools
4. Client receives streaming response via SSE

---

## Pre-flight (run before any implementation)

```bash
# Verify on correct branch
git branch --show-current
# Must output: stage/stage-12-ai-agent-setup

# Verify license gate
grep "license_status" agentic/PROJECT.md

# Check version before installing
npm info @anthropic-ai/sdk version
```

---

## Files to Create

### 1. `scripts/setup-anthropic-agent.ts`

One-time script run by Dev (not by worker in production). Creates:
- Anthropic Environment (`type: cloud, networking: unrestricted`)
- Anthropic Agent with `agent_toolset_20260401` and system prompt

Print output:
```
ANTHROPIC_ENV_ID=env_xxx
ANTHROPIC_AGENT_ID=agent_xxx
→ Add these to wrangler.toml and .dev.vars
```

Agent system prompt must include:
- Files are mounted at /workspace/
- Always use bash/write/edit tools to make changes
- After editing, run: git add -A && git commit -m "<description>" && git push origin main
- Summarize what you changed at the end

### 2. `packages/db/migrations/agent.sql`

```sql
CREATE TABLE IF NOT EXISTS agent_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  vault_id TEXT NOT NULL,
  github_repo_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL
);
```

Apply with:
```bash
wrangler d1 execute <db-name> --remote --file packages/db/migrations/agent.sql
```

### 3. `apps/api/src/domains/agent/agent.schema.ts`

Zod schemas for:
- `createVaultSchema` — `{ githubPat: string, githubRepoUrl: string }`
- `createSessionSchema` — `{ githubRepoUrl: string, vaultId: string }`
- `sendMessageSchema` — `{ sessionId: string, message: string }`
- `streamQuerySchema` — `{ sessionId: string }`
- `filesQuerySchema` — `{ sessionId: string }`

### 4. `apps/api/src/domains/agent/agent.handler.ts`

Functions using `@anthropic-ai/sdk`:

**`createVault(apiKey, githubPat, githubRepoUrl)`**
- `anthropic.beta.vaults.create({ name: ... })`
- `anthropic.beta.vaults.credentials.create(vaultId, { auth: { type: 'environment_variable', secret_name: 'GITHUB_TOKEN', secret_value: githubPat, networking: { type: 'unrestricted' } } })`
- Returns `{ vaultId }`

**`createAgentSession(apiKey, agentId, envId, vaultId, githubRepoUrl)`**
- `anthropic.beta.sessions.create({ agent: agentId, environment_id: envId, vault_ids: [vaultId], resources: [{ type: 'github_repository', url: githubRepoUrl, authorization_token: githubPat, mount_path: '/workspace', checkout: { type: 'branch', name: 'main' } }] })`
- Returns `{ sessionId }`

**`sendMessage(apiKey, sessionId, message)`**
- `anthropic.beta.sessions.events.send(sessionId, { events: [{ type: 'user.message', content: [{ type: 'text', text: message }] }] })`

**`streamSession(apiKey, sessionId)`**
- Returns `anthropic.beta.sessions.events.stream(sessionId)` async iterator

**`listSessionFiles(apiKey, sessionId)`**
- `anthropic.beta.files.list({ scope_id: sessionId }, { headers: { 'anthropic-beta': 'managed-agents-2026-04-01' } })`
- Returns file list with download URLs

### 5. `apps/api/src/domains/agent/agent.route.ts`

Bindings type must include:
```typescript
ANTHROPIC_API_KEY: string
ANTHROPIC_AGENT_ID: string
ANTHROPIC_ENV_ID: string
DB: D1Database
```

All routes MUST:
1. Verify auth session (use `createAuth` + `auth.api.getSession` pattern from payment.route.ts)
2. Return `401` if no session

**Routes:**

`POST /api/agent/vault`
- Auth guard
- Parse body with `createVaultSchema`
- Call `createVault(apiKey, githubPat, githubRepoUrl)`
- Insert row into `agent_sessions` D1 table (status: 'vault_created')
- Return `{ vaultId }`

`POST /api/agent/session`
- Auth guard
- Parse body with `createSessionSchema`
- Call `createAgentSession(...)`
- Update D1 row: set session_id, status: 'active'
- Return `{ sessionId }`

`POST /api/agent/message`
- Auth guard
- Parse body with `sendMessageSchema`
- Call `sendMessage(apiKey, sessionId, message)`
- Return `{ ok: true }`

`GET /api/agent/stream`
- Auth guard
- Parse query with `streamQuerySchema`
- Use `streamSSE` from `hono/streaming`
- For each event from `streamSession()`:
  - `agent.message` → SSE event: `agent_message`, data: `{ text }`
  - `agent.tool_use` → SSE event: `tool_use`, data: `{ tool: event.name }`
  - `agent.thinking` → SSE event: `thinking`, data: `{ text }`
  - `session.status_idle` → SSE event: `done`, data: `{}`; break
  - `session.status_terminated` → SSE event: `done`, data: `{}`; break

`GET /api/agent/files`
- Auth guard
- Parse query with `filesQuerySchema`
- Call `listSessionFiles(apiKey, sessionId)`
- Return `{ files: [{ id, filename, size_bytes }] }`

### 6. Update `apps/api/src/index.ts`

Add:
```typescript
import { agentRouter } from './domains/agent/agent.route'
// ...
app.route('/api/agent', agentRouter)
```

### 7. Update `apps/api/wrangler.toml`

Add under `[vars]` comment block:
```toml
# Agent secrets — set via: wrangler secret put <NAME>
# ANTHROPIC_API_KEY
# ANTHROPIC_AGENT_ID
# ANTHROPIC_ENV_ID
```

---

## Files to NOT Touch

- Any file outside `apps/api/src/domains/agent/`, `packages/db/migrations/agent.sql`, `apps/api/src/index.ts`, `apps/api/wrangler.toml`, `scripts/setup-anthropic-agent.ts`
- All governance files in `agentic/`
- Other domain files (payment, storage, forum, etc.)

---

## Parallel Execution Required

When reading multiple files to understand patterns, read them simultaneously.
When creating agent.schema.ts, agent.handler.ts, agent.route.ts — these can be written in parallel.
Only write agent.route.ts after agent.schema.ts and agent.handler.ts are complete (dependency).
Only update index.ts after agent.route.ts is complete.

---

## Acceptance Criteria Checklist

Complete every item before writing gate-out:

- [ ] `npm info @anthropic-ai/sdk version` run — version recorded
- [ ] `scripts/setup-anthropic-agent.ts` created and documented
- [ ] `packages/db/migrations/agent.sql` created
- [ ] D1 migration applied: `wrangler d1 execute ... --file packages/db/migrations/agent.sql`
- [ ] D1 table verified: `wrangler d1 execute ... --command "SELECT name FROM sqlite_master WHERE type='table'"` shows `agent_sessions`
- [ ] `agent.schema.ts` created with all 5 schemas
- [ ] `agent.handler.ts` created with all 5 functions
- [ ] `agent.route.ts` created with all 5 routes, auth guard on each
- [ ] `apps/api/src/index.ts` updated — agentRouter mounted
- [ ] `wrangler.toml` updated — secret comments added
- [ ] `pnpm type-check` exits 0
- [ ] `wrangler deploy` from apps/api succeeds

---

## Gate-Out Location

`gate-out/stage-12-ai-agent-setup.md`
