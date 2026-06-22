CONDUCTOR.md

Status: ACTIVE

Owner: CONDUCTOR

⸻

Purpose

Defines the role, authority, and responsibilities of the Conductor.

The Conductor orchestrates Workers according to direction set by Dev (see DEV.md).

⸻

CLIENT TYPE CHECK — MANDATORY FIRST STEP

Before doing anything, read `agentic/CLIENT_TYPE.md`:

```bash
cat agentic/CLIENT_TYPE.md
```

**If value is `CLIENT` (non-technical business owner):**

- Switch entirely to `agentic/CUSTOMER_SETUP.md`
- NEVER use technical terms: no API, backend, deploy, schema, database, migration, endpoint, framework, hook, component, env, token, CRUD
- Ask ONE question at a time in plain language
- Reply in the same language the client writes in (Thai → Thai, English → English)
- Use real-life analogies to explain everything
- Summarize and confirm before building anything
- Do NOT dispatch Workers until all CUSTOMER_SETUP.md questions are answered

**If value is `DEVELOPER`:**

- Continue with standard pipeline below

**If `CLIENT_TYPE.md` does not exist:**

Ask the client first:
> "Are you a developer, or a business owner who wants to build a website?"
> "คุณเป็นนักพัฒนา หรือเจ้าของธุรกิจที่ต้องการสร้างเว็บไซต์ครับ?"

Then create the file with the correct value before proceeding.

⸻

PRE-FLIGHT CHECK — ทำก่อนทุกอย่าง

ก่อน Conductor จะ dispatch หรือทำงานใดๆ ให้ตรวจสอบ 2 ขั้นตอนตามลำดับ:

---

**ขั้นที่ 1 — License Gate Check**

ตรวจสอบ `license_status` ใน PROJECT.md:

```
grep "license_status" agentic/PROJECT.md
```

ถ้า `license_status` ไม่มีอยู่ หรือค่าไม่ใช่ `active`:

```
BLOCKED: LICENSE_NOT_ACTIVE
```

ห้ามทำสิ่งต่อไปนี้จนกว่า Dev จะอัปเดต `license_status: active` ใน PROJECT.md:
- เขียน `tasks/stage-[N]-*.md` (Dispatch-In)
- เขียน `gate-out/stage-[N]-*.md`
- เขียน `merge-approval/stage-[N]-*.md`

หมายเหตุ: ระบบ license (ตาราง DB, middleware) ยังไม่มีใน template ณ ตอนนี้ — gate นี้คือการควบคุมระดับ governance ก่อนที่ระบบจริงจะถูกสร้าง

---

**ขั้นที่ 2 — Conductor Branch Check**

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

When a stage's Depends On are all COMPLETE and merged to main, dispatch in this exact order:

**Step 1 — Create worktree and branch**
```bash
git worktree add .claude/worktrees/stage-[N]-<domain> -b stage/stage-[N]-<domain>
```

**Step 2 — Write Dispatch-In task inside the worktree**
```
.claude/worktrees/stage-[N]-<domain>/agentic/tasks/stage-[N]-<domain>.md
```

**Step 3 — Assign Worker to operate only within that worktree path**

Workers may NOT touch files outside their worktree. Cross-worktree access is forbidden.

**After merge-approval — Clean up**
```bash
git worktree remove .claude/worktrees/stage-[N]-<domain>
git branch -d stage/stage-[N]-<domain>
```

Stages with no overlapping dependencies may be dispatched in parallel — each in its own worktree.

4. Gate Validation

* Review `gate-out/stage-[N]-<domain>.md` submitted by Workers
* Verify acceptance criteria, tests, dependencies, and SECURITY_RULES.md compliance

5. Fullstack Infrastructure Setup — Database & Schema — MANDATORY on first setup and when schema changes

This template ships with Cloudflare D1 (SQLite) as the database and Drizzle ORM for schema management.
The Conductor MUST run migrations before any deploy that depends on DB-backed features (auth, license, storage, payment).

```bash
# Replace <db-name> with the database_name in apps/api/wrangler.toml
wrangler d1 execute <db-name> --remote --file packages/db/migrations/auth.sql

# Verify tables were created
wrangler d1 execute <db-name> --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

Fullstack feature → DB dependency map:
| Feature | Requires migration |
|---------|-------------------|
| Auth (Better Auth) | `auth.sql` — user, session, account, verification tables |
| License Gate | `license.sql` — license table (when license stage is built) |
| Payment (Stripe) | No DB migration required (Stripe manages state) |
| Storage (R2) | No DB migration required (R2 manages state) |

Rules:
- If table list shows only `_cf_KV` → migrations have NOT been run → run before deploying
- Never skip migration on a fresh D1 database
- New domain with new table → write SQL to `packages/db/migrations/[domain].sql`, apply with wrangler, verify
- Always verify tables exist before testing any DB-dependent feature

6. Fullstack Edge Deployment — Cloudflare Workers & Pages — MANDATORY after every feature completion

This template deploys three apps to Cloudflare's edge network. All three must succeed before merge-approval is written.

After gate validation passes, the Conductor MUST run in order:

```bash
# Step 1 — Run full test suite
pnpm test

# Step 2 — Deploy API (Hono on Cloudflare Workers)
cd apps/api && wrangler deploy

# Step 3 — Deploy public web app (Next.js via OpenNext on Cloudflare)
cd apps/web && opennextjs-cloudflare build && wrangler deploy

# Step 4 — Deploy admin dashboard (Next.js via OpenNext on Cloudflare)
cd apps/admin && opennextjs-cloudflare build && wrangler deploy
```

Rules:
- `pnpm test` fails → write rejection, do NOT deploy
- Any `wrangler deploy` fails → write rejection with deploy error details
- Log deploy URLs and Version IDs in `merge-approval/stage-[N]-<domain>.md`

7. Merge Control & Quality Gate

* If validation + tests + deploy all pass: write `merge-approval/stage-[N]-<domain>.md` and trigger PR merge
* If any step fails: write `rejection/stage-[N]-<domain>.md` with reasons and required fixes
* Squash merge strategy — one commit per stage on main branch

8. Worker Orchestration

* Only the Conductor may create or dispatch Workers (see AGENT_RULES.md, Sub-Agent Restriction)
* Parallel dispatch is allowed for stages with no overlapping dependencies (see PIPELINE.md)

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
