QUESTIONS.md

Status: ACTIVE

Owner: CONDUCTOR

⸻

Purpose

Answer all questions below before using this template on a real project.

Conductor will use the answers to automatically update the relevant governance files.

⸻

How to Use (Conductor)

**Ask one question at a time — start immediately when the client opens the conversation (e.g. "hi", "hello").**

Rules for Conductor:
- **Read `DECISIONS.md` and `ARCHITECTURE.md` before asking any question.** These files may be empty in a fresh setup — that is expected. Read them to understand what template defaults already exist, so you can guide the client with informed suggestions rather than asking them to specify everything from scratch.
- **The very first question MUST be the Starter Question** — "Are you a developer or a business owner?" — before Q0 or anything else.
- Ask exactly one question per message. Wait for the client's answer before asking the next.
- Start asking immediately. Do NOT wait for the client to type "start" or any command.
- Save the answer to the file specified in "→ Update file" as soon as it is received.
- Never bundle multiple questions into a single message.
- If the answer is unclear, ask for clarification with an example before moving on.
- If the client requests a language (Thai / Chinese / English), translate all subsequent questions and responses into that language.

Question order (strict):
1. Send opening message
2. Ask Starter Question → determine CLIENT_TYPE → route accordingly
3. If DEVELOPER → continue Q0, Q1, Q2 … in order
4. If CLIENT → stop, switch to CUSTOMER_SETUP.md

Opening message (send this before the first question):

> "I'm your Conductor assistant — here to help set up your project. Feel free to type anything at any time."

⸻

## Starter Question ⚠️ FIRST — Ask before everything else
→ Update file: `CLIENT_TYPE.md`

Ask this question first, immediately when the client starts the conversation:

> "Are you a developer, or a business owner who wants to build a website?"

| Answer | Conductor action |
|--------|-----------------|
| Developer | Write `DEVELOPER` to `CLIENT_TYPE.md` → continue with this QUESTIONS.md |
| Business owner | Write `CLIENT` to `CLIENT_TYPE.md` → **stop QUESTIONS.md** → switch to `CUSTOMER_SETUP.md` immediately |

> If unsure, ask: "What are you planning to use this template for?"
> - Building a website for your own business → CLIENT
> - Using it as a starter for development → DEVELOPER

Answer: [TBD]

⸻

## Section 0 — Project Owner ⚠️ MANDATORY FIRST
→ Update file: PROJECT.md
→ Action: Conductor must SET role = 'owner' in the database for this email after deploy

Q0. What is the project owner's email address?

> This email will automatically receive `owner` permissions — able to manage roadmap, forum, and all system settings.
> Must match the email used to log in to the system.

Answer: [TBD]

⸻

## Section 1 — Project Identity
→ Update file: PROJECT.md

Q1. What is the project name?

Answer: [TBD]

---

Q2. What does this project do? (1–3 sentences — the core problem it solves)

Answer: [TBD]

---

Q3. Who are the target users?

Answer: [TBD]

---

Q4. What is the current status of the project?

- [ ] Greenfield — starting from scratch
- [ ] Existing codebase — building on top of existing code
- [ ] Prototype — already have a proof-of-concept

Answer: [TBD]

⸻

## Section 2 — Tech Stack
→ Update file: DECISIONS.md

Q5. What is the primary language?

> ⚠️ This template uses **TypeScript** as the primary language — recommended for compatibility with the existing codebase.

- [ ] TypeScript *(used in this template — recommended)*
- [ ] JavaScript
- [ ] Python
- [ ] Go
- [ ] Other: [specify]

Answer: [TBD]

---

Q6. Describe your project idea and what you want to achieve.

- What type of project is this? (web app, mobile app, API, tool, etc.)
- What is the main thing users can do in it?
- What pages or screens do you want? (e.g. landing page, dashboard, login, settings)
- What is the expected output or result the user gets?

> Conductor: use the answers to infer the frontend framework, page structure, and feature scope. Do not ask for the framework directly — decide it from context.

Answer: [TBD]

---

Q7. Backend framework?

Examples: Express, Fastify, FastAPI, Django, NestJS, Hono, None (frontend-only)

Answer: [TBD]

---

Q8. Database?

Examples: PostgreSQL, MySQL, MongoDB, SQLite, Supabase, PlanetScale, None

Answer: [TBD]

---

Q9. Authentication / Authorization?

Examples: JWT, NextAuth, Clerk, Supabase Auth, Firebase Auth, OAuth2, None

Answer: [TBD]

---

Q10. Deployment platform?

Examples: Vercel, Railway, AWS, GCP, Fly.io, Docker self-hosted

Answer: [TBD]

---

Q11. Package manager?

- [ ] npm
- [ ] yarn
- [ ] pnpm
- [ ] bun

Answer: [TBD]

⸻

## Section 3 — Architecture & Structure
→ Update file: ARCHITECTURE.md, CONTRACTS.md

Q12. What is the architecture style?

Examples: Monolith, Monorepo (Turborepo/Nx), Microservices, Serverless, Full-stack SSR

Answer: [TBD]

---

Q13. What modules / domains does the project consist of?

Examples: auth, user, product, payment, notification, admin

Answer: [TBD]

---

Q14. Are there any external services or third-party APIs required?

Examples: Stripe, SendGrid, Twilio, AWS S3, OpenAI API

Answer: [TBD]

---

Q15. What is the desired folder structure?

Example:
```
src/
  app/        (Next.js App Router)
  components/
  lib/
  server/
```

Answer: [TBD]

⸻

## Section 4 — Code Style & Patterns
→ Update file: DECISIONS.md

Q15b. IDE / Editor used for development?

- [ ] VS Code
- [ ] Cursor
- [ ] WebStorm / JetBrains
- [ ] Neovim / Vim
- [ ] Other: [specify]

> If using VS Code or Cursor — recommended to install the Claude Code extension to chat with AI directly inside the editor.

Answer: [TBD]

---

Q16. Linting / Formatting tools?

Examples: ESLint + Prettier, Biome, Ruff (Python)

Answer: [TBD]

---

Q17. Naming conventions?

Example:
- Components: PascalCase
- Functions/variables: camelCase
- Files: kebab-case
- Constants: UPPER_SNAKE_CASE

Answer: [TBD]

---

Q18. Testing framework?

Examples: Vitest, Jest, Playwright, Cypress, pytest

Answer: [TBD]

---

Q19. State management (if frontend exists)?

Examples: Zustand, Jotai, Redux Toolkit, TanStack Query, Context API, None

Answer: [TBD]

---

Q20. TypeScript usage?

- [ ] Yes — strict mode
- [ ] Yes — relaxed
- [ ] No

Answer: [TBD]

⸻

## Section 5 — Pipeline & Stages
→ Update file: PIPELINE.md

Q21. List of stages to build (in order)?

Example:
```
Stage 1 — setup       (project scaffold, config)
Stage 2 — auth        (login, register, session)
Stage 3 — user        (profile, settings)
Stage 4 — core        (main feature)
Stage 5 — api         (REST endpoints)
Stage 6 — ui          (pages, components)
Stage 7 — tests       (e2e, integration)
```

Answer: [TBD]

---

Q22. Which stages can be done in parallel?

Answer: [TBD]

---

Q23. What is the branch name that all PRs will merge into? ⚠️ BLOCKING
(This value will replace the `<conductor-branch>` placeholder across all governance files.)

Examples: main, develop, conductor

> This must be answered before starting the project. Conductor and Worker will be BLOCKED until answered.
> See PRE-FLIGHT CHECK in CONDUCTOR.md and START_HERE.md.

Answer: [TBD]

⸻

## Section 6 — Roadmap & Goals
→ Update file: ROADMAP.md

Q24. Short-term goals (1–4 weeks)?

Answer: [TBD]

---

Q25. Long-term vision?

Answer: [TBD]

---

Q26. What is the first milestone considered "done"?

Example: MVP where users can log in and use the core feature

Answer: [TBD]

⸻

## Section 7 — Security & Environment
→ Update file: SECURITY_RULES.md

Q27. What sensitive data does this project handle?

Examples: user PII, payment data, health records, None

Answer: [TBD]

---

Q28. Are there separate environments?

- [ ] dev / staging / production
- [ ] dev / production
- [ ] development only

Answer: [TBD]

---

Q29. Any special compliance requirements?

Examples: PDPA, GDPR, PCI-DSS, HIPAA, None

Answer: [TBD]

⸻

## Conductor Instructions

After the client has answered all questions, Conductor must:

0. **⚠️ SET OWNER ROLE FIRST** — run this SQL in the D1 database immediately after the first deploy:
   ```sql
   UPDATE user SET role = 'owner' WHERE email = '<answer from Q0>';
   ```
   Verify with:
   ```sql
   SELECT id, name, email, role FROM user WHERE email = '<answer from Q0>';
   ```
   Must see `role = 'owner'` before proceeding.

1. PROJECT.md — update: name, description, target users, status (from Q1–Q4)
2. DECISIONS.md — update: full tech stack, naming conventions, testing, code style (from Q5–Q20)
3. ARCHITECTURE.md — update: architecture type, modules, external services, folder structure (from Q12–Q15)
4. CONTRACTS.md — create initial contracts for each module (from Q13–Q14)
5. PIPELINE.md — create stage list, Depends On, conductor-branch (from Q21–Q23)
6. ROADMAP.md — update: goals, vision, milestone (from Q24–Q26)
7. SECURITY_RULES.md — add/edit rules to match sensitive data and compliance (from Q27–Q29)
8. All `<conductor-branch>` in PIPELINE.md, PROJECT.md, AGENT_RULES.md, README.md — replace with the real branch name (from Q23)
9. Log all changes in DEV_LOG.md

⸻

Status

- [ ] Section 1 — Project Identity: not answered
- [ ] Section 2 — Tech Stack: not answered
- [ ] Section 3 — Architecture: not answered
- [ ] Section 4 — Code Style: not answered
- [ ] Section 5 — Pipeline: not answered
- [ ] Section 6 — Roadmap: not answered
- [ ] Section 7 — Security: not answered
- [ ] Conductor updated all governance files: not done
- [ ] Setup Test PASSED: not done

⸻

## Setup Test — Run after Conductor has updated all governance files

Conductor runs this test to confirm governance is ready for use.

All passing = pipeline can start.

---

### T1 — No placeholders remaining

```bash
grep -rn "\[TBD\]\|<conductor-branch>\|\[name\]\|\[N\]" \
  PROJECT.md ROADMAP.md ARCHITECTURE.md CONTRACTS.md \
  DECISIONS.md PIPELINE.md SECURITY_RULES.md AGENT_RULES.md README.md
```

Result: must produce no output — if any, those files still need updating.

Result: [ ] PASS / [ ] FAIL

---

### T2 — conductor-branch exists in git

```bash
git branch -a | grep -F "<real conductor-branch name from Q23>"
```

Result: must find that branch — if not found, Conductor must create it first.

Result: [ ] PASS / [ ] FAIL

---

### T3 — PROJECT.md has real content

Verify manually:
- [ ] Has a real project name (not "My Project" or a placeholder)
- [ ] Has a description explaining the core problem
- [ ] Has target users
- [ ] Has current status

Result: [ ] PASS / [ ] FAIL

---

### T4 — DECISIONS.md has complete tech stack

Verify manually:
- [ ] Primary language
- [ ] Frontend framework (or noted as API-only)
- [ ] Backend framework (or noted as frontend-only)
- [ ] Database (or noted as none)
- [ ] Authentication method
- [ ] Package manager
- [ ] Testing framework
- [ ] Linting/formatting tools
- [ ] Naming conventions

Result: [ ] PASS / [ ] FAIL

---

### T5 — PIPELINE.md has real stages

```bash
grep -c "Stage\|PENDING\|IN_PROGRESS" PIPELINE.md
```

Result: must return a value greater than 0.

Verify manually:
- [ ] At least 1 stage exists
- [ ] Every stage has `Depends On` specified
- [ ] `<conductor-branch>` has been replaced with the real name

Result: [ ] PASS / [ ] FAIL

---

### T6 — ARCHITECTURE.md and CONTRACTS.md are not empty

```bash
wc -l ARCHITECTURE.md CONTRACTS.md
```

Result: both files must have more than 10 lines.

Result: [ ] PASS / [ ] FAIL

---

### T7 — DEV_LOG.md has a setup entry

Verify manually:
- [ ] At least 1 entry recording the governance update from QUESTIONS.md

Result: [ ] PASS / [ ] FAIL

---

### T8 — Worker simulation

Conductor sends this prompt to a new Worker agent:

> "Read START_HERE.md and report: what is this project, what is the tech stack, and what is the first stage to work on?"

Worker must answer correctly without asking the developer.

- [ ] Worker names the project correctly
- [ ] Worker identifies the tech stack correctly
- [ ] Worker identifies the first stage
- [ ] Worker is not BLOCKED

Result: [ ] PASS / [ ] FAIL

---

### Test Summary

| Test | Result |
|------|--------|
| T1 — No placeholders | |
| T2 — conductor-branch exists in git | |
| T3 — PROJECT.md complete | |
| T4 — DECISIONS.md complete | |
| T5 — PIPELINE.md complete | |
| T6 — ARCHITECTURE.md / CONTRACTS.md not empty | |
| T7 — DEV_LOG.md has entry | |
| T8 — Worker simulation | |

All passing → update Status checklist above, then start pipeline.

Any FAIL → fix and re-run that test before starting the pipeline.
