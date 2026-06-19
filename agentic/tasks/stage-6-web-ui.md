Stage Task: stage-6-web-ui

Gate-In Verified: YES
Status: IN_PROGRESS
Assigned To: Worker Agent
Domain: apps/web

---

## Objective

Build the public-facing Next.js website for the Fullstack Builder AI starter kit.
Two main goals: (1) sell the kit to potential customers, (2) onboard new customers interactively.

---

## Required Reading

Before starting, read:
- agentic/START_HERE.md
- agentic/AGENT_RULES.md
- agentic/ARCHITECTURE.md
- agentic/DECISIONS.md

---

## Scope

You may ONLY modify files inside `apps/web/`.
Do NOT touch apps/admin, apps/api, packages/*, or any agentic/ files.

---

## Deliverables

### 1. Landing Page — app/page.tsx

Replace the current "Coming Soon" placeholder with a real landing page.

Sections (in order):
- **Hero** — headline, subheadline, CTA button "Get Started"
- **Problem** — "WordPress is slow, expensive, hard to customize"
- **Solution** — "Fullstack app on Cloudflare. AI builds it for you."
- **Features** — 4 cards: Fast (Cloudflare Edge), Secure (Better Auth), Smart (AI Conductor), Yours (own your code)
- **How it works** — 3 steps: Buy kit → Tell AI what you want → Get your app
- **CTA section** — "Start building today" button → /setup

No external UI libraries. Use inline styles or CSS modules only.
Keep it clean and minimal.

### 2. Onboarding Setup Page — app/setup/page.tsx

Interactive question-by-question setup flow (inspired by go-blueprint.dev).
This page walks new customers through CUSTOMER_SETUP.md questions in a UI.

Behavior:
- Show one question at a time
- Progress bar at top (e.g. "Step 3 of 8")
- "Next" button to proceed, "Back" to go back
- Final step shows a summary of all answers
- On submit: POST answers to /api/setup (stub — just console.log for now, real API in stage-8)

Questions to include (from agentic/CUSTOMER_SETUP.md Sections 1–3, simplified for UI):
1. What is your business name?
2. What does your business do? (text input)
3. Who are your customers? (text input)
4. What language should your website be in? (Thai / English / Both)
5. What do you want your website to do? (multi-select checkboxes)
6. Do you need an admin panel? (Yes / No)
7. Do you want to accept online payments? (Yes / No / Later)
8. What style do you prefer? (Clean / Elegant / Bright / Formal) — show color swatches

Architecture rules (MUST follow):
- components/setup/ — pure UI components (ProgressBar, QuestionCard, OptionButton)
- hooks/use-setup.ts — all state logic (current step, answers, next/back/submit)
- store/setup.store.ts — Zustand store for setup answers (persists across steps)
- app/setup/page.tsx — orchestrates hook + components, passes props only

### 3. Auth Pages (already scaffolded — verify they work)

- app/(auth)/login/page.tsx — verify LoginForm renders correctly
- app/(auth)/register/page.tsx — verify RegisterForm renders correctly

---

## Architecture Rules

Follow the 4-layer pattern strictly:
- `components/` — pure UI, props only, no store access, no fetch calls
- `hooks/` — business logic, state, fetch calls
- `store/` — Zustand global state only
- `app/page.tsx` — orchestrate hook + components, pass results as props

---

## Acceptance Criteria

- [ ] Landing page renders at /
- [ ] Hero section has CTA button linking to /setup
- [ ] Setup page shows one question at a time with progress bar
- [ ] Setup page has Back/Next navigation
- [ ] Setup page shows summary on final step
- [ ] Login page renders at /login
- [ ] Register page renders at /register
- [ ] No TypeScript errors (tsc --noEmit passes)
- [ ] No hardcoded Thai text in component files (UI text in English, page text can be bilingual)
- [ ] All files follow naming conventions: components PascalCase, files kebab-case

---

## Completion

When done, create: agentic/gate-out/stage-6-web-ui.md
