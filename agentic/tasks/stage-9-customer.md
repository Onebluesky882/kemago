stage-9-customer

Gate-In Verified: YES

---

## Assignment

**Stage:** stage-9-customer
**Domain:** apps/web/app/setup, apps/web/hooks/use-setup.ts, apps/web/store/setup.store.ts, apps/api/src/domains/setup, packages/db/migrations/setup.sql
**Branch:** stage/stage-9-customer
**Worktree:** .claude/worktrees/stage-9-customer/

---

## Objective

Wire the CUSTOMER_SETUP.md onboarding flow into a working web page. Non-technical clients open /setup, answer questions about their business (starting with language), and submit. The API saves answers to D1. The Conductor reads the saved answers to map to pipeline stages.

Q0 (language) MUST be the first question — per CONDUCTOR.md Language Rule.

---

## Files to Create / Modify

### 1. `packages/db/migrations/setup.sql`
```sql
CREATE TABLE IF NOT EXISTS setup_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  language TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_description TEXT,
  target_customers TEXT,
  website_features TEXT,
  needs_admin_panel TEXT,
  online_payments TEXT,
  preferred_style TEXT,
  website_pages TEXT,
  timeline TEXT,
  submitted_at INTEGER NOT NULL
);
```

### 2. `apps/api/src/domains/setup/setup.schema.ts`
Zod schema for POST /api/setup body — all fields optional except language and businessName.

### 3. `apps/api/src/domains/setup/setup.handler.ts`
`saveSetup(db: D1Database, data)` — inserts row into setup_submissions.

### 4. `apps/api/src/domains/setup/setup.route.ts`
- `POST /api/setup` — save submission, return `{ ok: true, id }`
- No auth required (client may not be logged in yet)

### 5. Update `apps/api/src/index.ts`
Mount setupRouter at `/api/setup`.

### 6. Update `apps/web/store/setup.store.ts`
Expand SetupAnswers to include all fields:
`language, businessName, businessDescription, targetCustomers, websiteFeatures, needsAdminPanel, onlinePayments, preferredStyle, websitePages, timeline`

### 7. Update `apps/web/hooks/use-setup.ts`
Replace STEPS with the full Q0-Q9 sequence. Q0 (language) MUST be index 0.

**STEPS in order:**
- Q0: language — single select: Thai, English, Japanese, Chinese, Korean, Other
- Q1: businessName — text
- Q2: businessDescription — textarea
- Q3: targetCustomers — textarea
- Q4: websiteFeatures — multi: ecommerce, bookings, members, payments, blog, contact, portfolio
- Q5: needsAdminPanel — single: Yes / Not sure
- Q6: onlinePayments — single: Yes / Not yet / No
- Q7: preferredStyle — single: Minimal & clean / Colorful & fun / Corporate & formal / Bold & creative
- Q8: websitePages — multi: Home, About, Contact, Blog, Products, Booking, Gallery
- Q9: timeline — single: Urgent (1-2 weeks) / Normal (about 1 month) / Flexible (no rush)

`submit()` must call `POST /api/setup` with all answers.

### 8. Create `apps/web/app/setup/page.tsx`
Full onboarding wizard page. Uses existing components:
- `hooks/use-setup.ts` for logic
- `components/setup/QuestionCard.tsx` for each step
- `components/setup/ProgressBar.tsx` for progress
- `components/setup/OptionButton.tsx` for options

Flow:
1. Show Q0 (language) → user picks language → all subsequent question labels must switch to that language
2. Progress through Q1-Q9 with Back/Next buttons
3. Summary screen showing all answers before submit
4. Thank-you screen after submit

Back button on every step → router.back() on step 0, previous step otherwise.
No emoji. No `<a href>` for internal links.

---

## Acceptance Criteria

- [ ] `packages/db/migrations/setup.sql` created
- [ ] D1 migration applied: `wrangler d1 execute ... --file packages/db/migrations/setup.sql`
- [ ] `apps/api/src/domains/setup/` created with route, handler, schema
- [ ] `POST /api/setup` saves to D1, returns `{ ok: true, id }`
- [ ] `apps/api/src/index.ts` mounts setupRouter
- [ ] `setup.store.ts` has all 10 fields
- [ ] `use-setup.ts` has Q0 as first step, Q0-Q9 all present
- [ ] `app/setup/page.tsx` created — accessible at /setup
- [ ] Q0 (language) is always the first question shown
- [ ] Progress bar shows current step / total steps
- [ ] Summary screen before submit
- [ ] Thank-you screen after submit
- [ ] No emoji, no `<a href>` for internal navigation
- [ ] Back button on every step
- [ ] `pnpm type-check` exits 0

---

## Do NOT Touch
- Any governance files in agentic/
- Any domain outside apps/web/app/setup, apps/web/hooks/use-setup.ts, apps/web/store/setup.store.ts, apps/api/src/domains/setup, apps/api/src/index.ts, packages/db/migrations/setup.sql

---

## Gate-Out Location
`gate-out/stage-9-customer.md`
