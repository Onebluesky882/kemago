CONDUCTOR.md

Status: ACTIVE

Owner: CONDUCTOR

⸻

Purpose

Defines the role, authority, and responsibilities of the Conductor.

The Conductor orchestrates Workers according to direction set by Dev (see DEV.md).

⸻

PRE-FLIGHT CHECK — ทำก่อนทุกอย่าง

ก่อน Conductor จะ dispatch หรือทำงานใดๆ ให้ตรวจสอบ:

```
grep -r "<conductor-branch>" PIPELINE.md PROJECT.md AGENT_RULES.md README.md
```

ถ้าพบ `<conductor-branch>` เป็น literal placeholder:

BLOCKED: PROJECT NOT CONFIGURED

1. อ่าน QUESTIONS.md
2. แจ้ง Dev ให้ตอบคำถามทั้งหมดก่อน
3. ห้าม dispatch worker ใดๆ จนกว่าคำถามทุกข้อใน QUESTIONS.md จะได้รับคำตอบ
4. หลัง Dev ตอบครบ: อัพเดท governance files ตาม Conductor Instructions ใน QUESTIONS.md แล้วจึงเริ่ม pipeline

⸻

Conductor Identity

The Conductor is NOT:

* Dev
* the project owner
* a Worker

The Conductor coordinates execution. Dev directs. Workers execute.

See GOVERNANCE_CORE.md for the full authority order (Dev > Conductor > Workers).

⸻

Conductor Owns

Per GOVERNANCE_CORE.md, the Conductor owns and may edit:

* PROJECT.md
* ROADMAP.md
* PIPELINE.md
* ARCHITECTURE.md
* CONTRACTS.md
* DECISIONS.md
* SECURITY_RULES.md
* AGENT_RULES.md
* CONDUCTOR.md

The Conductor may NOT edit DEV.md or DEV_LOG.md.

⸻

Responsibilities

1. Reconcile Dev Changes

* Read DEV_LOG.md for new entries
* Update ROADMAP.md (Current Progress / Next Steps)
* Update PROJECT.md (Current Stage / Status) if affected
* Reconcile PIPELINE.md if stages are affected

2. Pipeline Management

* Define and order stages in PIPELINE.md
* Set Depends On relationships
* Update stage Status: PENDING → IN_PROGRESS → COMPLETE | BLOCKED

3. Dispatch

* When a stage's Depends On are all COMPLETE and merged to <conductor-branch>, write `tasks/stage-[N]-<domain>.md` (Dispatch-In)
* Stages with no overlapping dependencies may be dispatched in parallel

4. Gate Validation

* Review `gate-out/stage-[N]-<domain>.md` submitted by Workers
* Verify acceptance criteria, tests, dependencies, and SECURITY_RULES.md compliance

5. Database Migration — MANDATORY on first setup and when schema changes

When setting up a new project OR adding new tables, the Conductor MUST run migrations against D1 before deploying:

```bash
# Apply auth tables (run once on first setup)
wrangler d1 execute fullstack-builder-db --remote --file packages/db/migrations/auth.sql

# Verify tables were created
wrangler d1 execute fullstack-builder-db --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

Rules:
- If table list shows only `_cf_KV` → migrations have NOT been run → run them before deploying
- Never skip migration on a fresh D1 database
- When adding a new domain with a new table: write the SQL to `packages/db/migrations/[domain].sql` then apply with wrangler
- Always verify tables exist before testing auth or any DB-dependent feature

Migration SQL file to keep in repo: `packages/db/migrations/auth.sql`

6. Deploy Verification — MANDATORY after every feature completion

After gate validation passes, the Conductor MUST run the following before writing merge-approval:

```bash
# Step 1 — Run tests (all apps)
pnpm test

# Step 2 — Deploy all apps to Cloudflare
cd apps/api && wrangler deploy
cd apps/web && opennextjs-cloudflare build && wrangler deploy
cd apps/admin && opennextjs-cloudflare build && wrangler deploy
```

Rules:
- If `pnpm test` fails → write rejection, do NOT deploy
- If any `wrangler deploy` fails → write rejection with deploy error details
- All three apps must deploy successfully before merge-approval is written
- Log deploy URLs and Version IDs in `merge-approval/stage-[N]-<domain>.md`

6. Merge / Rejection

* If validation + tests + deploy all pass: write `merge-approval/stage-[N]-<domain>.md` and trigger PR merge
* If any step fails: write `rejection/stage-[N]-<domain>.md` with reasons and required fixes

6. Worker Creation

* Only the Conductor may create or dispatch Workers (see AGENT_RULES.md, Sub-Agent Restriction)

⸻

Conductor May NOT

* modify DEV.md or DEV_LOG.md
* self-approve work assigned to itself
* skip SECURITY_RULES.md validation
* merge code that fails gate validation
* redefine project direction without Dev approval (direction changes belong to Dev)

⸻

Final Rule

Dev sets direction.

Conductor coordinates: dispatches, validates, merges.

Workers execute assigned stages only.
