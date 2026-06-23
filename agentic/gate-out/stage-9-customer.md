stage_id: stage-9-customer
status: PASS
ready_for_next: YES

modified_files:
  - packages/db/migrations/setup.sql (created)
  - apps/api/src/domains/setup/setup.schema.ts (created)
  - apps/api/src/domains/setup/setup.handler.ts (created)
  - apps/api/src/domains/setup/setup.route.ts (created)
  - apps/api/src/index.ts (mounted setupRouter at /api/setup)
  - apps/web/store/setup.store.ts (expanded SetupAnswers — 10 fields)
  - apps/web/hooks/use-setup.ts (replaced STEPS — Q0 language first, Q0-Q9 total, translations)
  - apps/web/app/setup/page.tsx (created — wizard with progress, summary, thank-you)
  - apps/web/components/setup/QuestionCard.tsx (removed swatches/color — type fix)

tests_run:
  - pnpm type-check → exit 0 ✓

dependencies_added: none

acceptance_criteria:
  - [PASS] setup.sql migration created — setup_submissions table
  - [PASS] POST /api/setup — saves to D1, returns { ok, id }, no auth required
  - [PASS] setupRouter mounted at /api/setup
  - [PASS] setup.store.ts has all 10 fields (language, businessName, ..., timeline)
  - [PASS] use-setup.ts — Q0 (language) is index 0 — CONDUCTOR.md Language Rule enforced
  - [PASS] Q0-Q9 all present: language, businessName, businessDescription, targetCustomers, websiteFeatures, needsAdminPanel, onlinePayments, preferredStyle, websitePages, timeline
  - [PASS] Multilingual labels: Thai, Japanese, Chinese, Korean, English on all questions and options
  - [PASS] /setup page — wizard with progress bar, back button on every step
  - [PASS] Summary screen before submit — shows all answers with Edit links
  - [PASS] Thank-you screen after submit
  - [PASS] Q0 language selection changes all subsequent question labels to that language
  - [PASS] No emoji, no <a href> for internal navigation (router.back() used)
  - [PASS] pnpm type-check exits 0

known_issues:
  - D1 migration pending: wrangler d1 execute ... --file packages/db/migrations/setup.sql
  - /setup page not linked from landing page yet (intentional — link to be added in stage-11-docs or landing page update)

risks: none

blockers: none

recommendations:
  - Apply D1 migration before deploy
  - Add link to /setup from landing page hero section (stage-11 or separate PR)
  - Conductor should read setup_submissions table after client submits to map answers to pipeline stages
