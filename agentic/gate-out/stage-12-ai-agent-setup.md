stage_id: stage-12-ai-agent-setup
status: PASS
ready_for_next: YES

modified_files:
  - apps/api/src/domains/agent/agent.schema.ts (created)
  - apps/api/src/domains/agent/agent.handler.ts (created)
  - apps/api/src/domains/agent/agent.route.ts (created)
  - apps/api/src/index.ts (added agentRouter import + mount)
  - apps/api/wrangler.toml (added ANTHROPIC secret comments)
  - packages/db/migrations/agent.sql (created)
  - scripts/setup-anthropic-agent.ts (created)

tests_run:
  - pnpm type-check → exit 0 ✓

dependencies_added:
  - @anthropic-ai/sdk, 0.105.0, Anthropic Managed Agents SDK for vault/session/stream API

acceptance_criteria:
  - [PASS] @anthropic-ai/sdk installed — version 0.105.0 verified via npm info
  - [PASS] scripts/setup-anthropic-agent.ts created — creates Environment + Agent, prints IDs
  - [PASS] packages/db/migrations/agent.sql created — agent_sessions table schema
  - [PASS] agent.schema.ts created — 5 Zod schemas (createVault, createSession, sendMessage, streamQuery, filesQuery)
  - [PASS] agent.handler.ts created — 5 functions (createVault, createAgentSession, sendMessage, streamSession, listSessionFiles)
  - [PASS] agent.route.ts created — 5 routes with auth guard on every route
  - [PASS] apps/api/src/index.ts updated — agentRouter mounted at /api/agent
  - [PASS] wrangler.toml updated — ANTHROPIC_API_KEY, ANTHROPIC_AGENT_ID, ANTHROPIC_ENV_ID secret comments added
  - [PASS] pnpm type-check exits 0
  - [PENDING] D1 migration — requires Dev to run: wrangler d1 execute <db-name> --remote --file packages/db/migrations/agent.sql
  - [PENDING] wrangler deploy — requires Dev to set secrets first: ANTHROPIC_API_KEY, ANTHROPIC_AGENT_ID, ANTHROPIC_ENV_ID

known_issues:
  - D1 migration and wrangler deploy blocked until Dev runs scripts/setup-anthropic-agent.ts and sets the 3 Anthropic secrets via wrangler secret put

risks:
  - Managed Agents beta API (managed-agents-2026-04-01) may change — monitor Anthropic changelog
  - SSE stream in Cloudflare Workers requires nodejs_compat flag (already set in wrangler.toml)

blockers: none for code — deploy requires Dev action (setup script + secrets)

recommendations:
  - Dev must run: ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/setup-anthropic-agent.ts
  - Then: wrangler secret put ANTHROPIC_API_KEY / ANTHROPIC_AGENT_ID / ANTHROPIC_ENV_ID
  - Then: wrangler d1 execute fullstack-builder-db --remote --file packages/db/migrations/agent.sql
  - Then: wrangler deploy from apps/api
  - Dispatch stage-13-ai-agent-chat after deploy confirmed
