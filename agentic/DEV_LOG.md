DEV_LOG.md

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

Date: 2026-06-23
File(s) changed: agentic/AGENT_RULES.md, agentic/PIPELINE.md, agentic/gate-out/stage-1 through stage-8, apps/api/src/domains/agent/agent.schema.ts
Reason: Refactor — (1) Added Table of Contents to AGENT_RULES.md (18 rules indexed). (2) Created retrospective gate-out stubs for stages 1-8 (previously COMPLETE but undocumented). (3) Fixed PIPELINE.md stage-12 acceptance criteria — added all 9 routes (was only listing 5). (4) Fixed agent.schema.ts: deployCompleteSchema.workerName changed from required to optional (field was defined but never read by the route handler).
Impact: gate-out/ directory now complete for all COMPLETE stages. AGENT_RULES.md navigable via ToC. PIPELINE.md fully accurate for stage-12 route count.

Date: 2026-06-23
File(s) changed: agentic/AGENT_RULES.md, agentic/DECISIONS.md
Reason: Add Agent Orchestration Pattern Rule — 4 patterns (Single, Supervisor, Parallel fan-out, Sequential safe mode). Decision flowchart enforces Sequential as default; Parallel is opt-in only when tasks are provably independent. Retry + fallback rules added. Violation = Status: FAIL.
Impact: Workers must document orchestration pattern choice in every multi-agent task file. Parallel requires explicit independence verification. Sequential is always safe.

Date: 2026-06-23
File(s) changed: agentic/AGENT_RULES.md, agentic/DECISIONS.md, agentic/PIPELINE.md
Reason: Add Observability Rule — every stage with agent calls must implement D1 structured logging (agent_logs table). Decision recorded in DECISIONS.md. stage-15-observability added to PIPELINE.md, parallel with stage-14.
Impact: All workers building stages with agent/API calls must write to agent_logs. Skipping = Status: FAIL. stage-15 must be dispatched in parallel with stage-14 (no dependencies between them).

Date: 2026-06-23
File(s) changed: agentic/CONDUCTOR.md, agentic/CUSTOMER_SETUP.md
Reason: Add Language Rule — Conductor must respond in the same language the client writes in (Thai→Thai, English→English, Japanese→Japanese, etc.). During starter setup, Q0 must be asked first to detect and record preferred language. Language saved to CUSTOMER_SETUP.md language field. Rule added to CONDUCTOR.md as top-priority rule before all other checks.
Impact: Conductor must ask Q0 (language preference) before any other question during first contact with a CLIENT-type client. Record the answer in CUSTOMER_SETUP.md `language:` field. All subsequent responses to that client must use the recorded language by default.

Date: 2026-06-23
File(s) changed: agentic/GOVERNANCE_CORE.md, agentic/CONDUCTOR.md, agentic/START_HERE.md
Reason: Add Language Rule — all governance files must be written in English only. Thai allowed only in client-facing chat and CUSTOMER_SETUP.md/QUESTIONS.md. Translated all Thai text in CONDUCTOR.md and START_HERE.md to English. Thai example strings kept as inline quotes only.
Impact: Workers and Conductor must write all gate-out, tasks, and governance content in English. Violation = Status: FAIL.

Date: 2026-06-23
File(s) changed: agentic/CONDUCTOR.md
Reason: Add mandatory deploy + client reload notification rule. After every deploy, Conductor must notify CLIENT-type clients to reload their browser in plain language (no technical terms). Rule 7 added under Responsibilities.
Impact: Conductor must send reload notification to client after every successful deploy. Never use "deploy/build/push/wrangler" with CLIENT type.

Date: 2026-06-23
File(s) changed: agentic/PIPELINE.md, agentic/tasks/stage-12-ai-agent-setup.md, agentic/DECISIONS.md
Reason: Add stages 12-14 for web-based Claude agent feature (Anthropic Managed Agents). Stage 12 covers backend API routes. Stage 13 covers admin UI chat interface. Stage 14 covers deploy status tracking. Decision recorded in DECISIONS.md for Anthropic Managed Agents pattern.
Impact: Conductor must dispatch stage-12-ai-agent-setup in parallel with stage-9-customer (both are ready now — neither depends on the other). Dev must run scripts/setup-anthropic-agent.ts once to create ANTHROPIC_AGENT_ID and ANTHROPIC_ENV_ID before stage-12 worker can test deployment.

Date: 2026-06-23
File(s) changed: agentic/AGENT_RULES.md, agentic/CONDUCTOR.md
Reason: Add mandatory parallel execution rules at both Worker and Conductor levels. Workers must execute independent operations in parallel (tool calls). Conductor must dispatch all ready stages simultaneously instead of sequentially.
Impact: Conductor must re-read CONDUCTOR.md Parallel Dispatch Rule section. On every dispatch decision, Conductor must collect ALL ready stages and dispatch them simultaneously. Workers must call independent tools in parallel within a single message — sequential execution of parallelizable operations is now a violation.

<!-- Add newest entries at the top -->
