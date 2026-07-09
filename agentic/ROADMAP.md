---
status: DRAFT
owner: CONDUCTOR
last_updated: 2026-06-25
---

# ROADMAP.md

> **Workers may read this document. Workers must NOT modify this document.**
> Implementation planning belongs in PIPELINE.md.

---

## Purpose

This document defines the long-term direction of the project.

Intended for: Product Owners, Project Managers, Architects, Developers, Future Contributors.

---

## Project Vision

[Describe the long-term vision of the project here.]

---

## Problem Statement

What problem does this project solve?

- Problem 1
- Problem 2
- Problem 3

---

## Business Goals

### Goal 1

Description: [TBD]

Success Criteria:
- [ ] TBD
- [ ] TBD
- [ ] TBD

### Goal 2

Description: [TBD]

Success Criteria:
- [ ] TBD
- [ ] TBD
- [ ] TBD

---

## Strategic Objectives

### Objective 1

Description: [TBD]

Success Indicators:
- [ ] TBD
- [ ] TBD
- [ ] TBD

### Objective 2

Description: [TBD]

Success Indicators:
- [ ] TBD
- [ ] TBD
- [ ] TBD

---

## Current Progress

- Added a rule that prevents the assistant from doing work beyond what was asked. For example, if you ask for a screen mockup only, it will not also build a backend or database.
- The admin panel now tracks how much each AI agent run actually costs, not just how much text it processed — this shows up on the Observability page as a dollar amount per run and a running total.
- The staff login issue found earlier (logins not staying signed in on a live deployment) has been fixed.
- The admin panel's Dashboard home page is now fully built: it shows system status, AI agent cost and usage at a glance, a cost trend chart, a success-rate gauge, and a feed of recent activity — with a 7/30/90-day range switch.
- The new "Monitor" section is complete — three dedicated pages for Cost, System Health, and Errors, all reachable from the sidebar menu, styled like a technology monitoring dashboard.
- Redesigned the admin login page and the whole admin panel to support both light mode and dark mode with a switch to toggle between them.
- A Telegram bot connection already existed in this project and is ready to use — no new work needed there.
- Added a Discord bot connection, ready for you to plug in your bot's keys and start using it.
- Added a crypto payment connection (NOWPayments) — lets customers pay with cryptocurrency, alongside the existing card payment option. Ready for you to plug in your account keys.
- Did a full readiness check across every feature in the system, to make sure a new project can start from this template and use what's already built without redoing any of it. Found and fixed 5 real problems:
  - The Roadmap/feedback feature had no database table set up for it at all — it would have failed the very first time anyone tried to use it on a brand-new project. Fixed.
  - Three features (session login check, AI agent, card payments) had a leftover placeholder setting that would have caused login/security checks to silently reject real traffic once the site went live on its real web address. Fixed.
  - The card payment (Stripe) code had a version mismatch that stopped the whole project from passing its build check. Fixed.
  - The setup instructions only told a new project to run 1 out of 17 required database setup steps — every other feature (forum, agent tracking, purchases, roadmap, etc.) would have been broken from day one. Rewrote the instructions with the full, correct steps in the right order.
- The customer setup questionnaire (the step-by-step form new visitors fill out to describe their business) now matches the look of the rest of the website — it was still using an old, mismatched color scheme left over from before the site's current style was chosen.
  - The internal "what's already built, don't rebuild it" reference list was missing the Telegram, Discord, and crypto payment features — fixed so future work won't recreate them by mistake.
- Did a full recheck of the internal rulebook itself (not the app — the instructions that guide how this project gets built). Found two spots where the written instructions described a safety check that no longer actually exists (it was removed a while back but the instructions were never updated to match) and one leftover blank placeholder in the decision log. Both fixed so the instructions now match reality. Left the still-blank project-info template files exactly as they are, as requested — they're meant to stay blank until someone starts a brand-new project from this template.
- Ran a real, small-scale test of the "team of AI helpers working at the same time" system this template is designed to support, to see if it actually works or if it was only ever written down on paper. Result: the core idea (two helpers working in fully separate copies of the project at once) does work. But the test also uncovered two real problems: one safety check that's supposed to stop a helper from finishing bad work would have wrongly blocked a helper over an unrelated issue somewhere else entirely in the project, and that same safety check may be possible to sneak around. Both are now written down as known issues to fix before this multi-helper system is relied on for real work. The test itself was intentionally stopped partway through once enough was learned, so nothing from it was kept in the live project.
- Fixed the "My Account" page crash found earlier — it now correctly checks and shows whether you've purchased/unlocked the app, using the payment system that was already built. The whole website now passes its full build check with zero errors, so it's ready to deploy again.
- Updated the public homepage's "what's included" section so it now honestly lists every service this starter kit offers — security, payments (card and crypto), database, file storage, an AI assistant, and chat bot support — described in plain terms, without naming the specific outside companies behind each one. The payment feature itself is still backend-only as noted above; this only updates how it's presented on the page.
- Restyled the "tell us about your business" onboarding form so it visually matches the rest of the site instead of using old, mismatched colors.
- Added a new shared toolkit for building chat bots (Telegram, LINE, and Facebook/Instagram messaging) into the project's reusable building blocks — it was already written but wasn't hooked up correctly, so it was fixed and documented. No new chat bot is turned on yet; this just makes it ready to build one faster whenever you want a LINE or Instagram/Facebook bot in addition to the existing Telegram and Discord ones.

---

## Milestone Backlog

Milestones may be added, removed, reordered, or refined by the Conductor.

| ID | Name | Goal | Status |
|----|------|------|--------|
| M-001 | TBD | TBD | PLANNING |
| M-002 | TBD | TBD | PLANNING |
| M-003 | TBD | TBD | PLANNING |

**Status values:** PLANNING · APPROVED · IN_PROGRESS · COMPLETE · CANCELLED

---

## Next Steps

<!-- Conductor updates this section to summarize, in plain language, what happens next. -->

- Monitor pages and Dashboard overview are done — no open items on this piece of work right now.
- To go live with the Discord bot and crypto payments, you'll need to provide your own account keys (Discord bot token, NOWPayments account key) — ask when you're ready and we'll walk through it.
- The crypto payment connection can receive payments but doesn't yet automatically mark an order as "paid" in the system — that logic needs your specific pricing plan rules before it's finished.
- Not urgent, but worth knowing: the card payment (Stripe) feature has no actual checkout page yet for customers to use — the backend works, but nobody's built the "click to pay" screen. Ask if you want that built.
- The new chat bot toolkit is ready but not turned into a working bot yet — say the word if you want a LINE or Instagram/Facebook bot actually connected and live (Telegram and Discord already are).
- Awaiting your direction on what to build next.

---

## Success Metrics

The project will be considered successful when:
- [ ] TBD
- [ ] TBD
- [ ] TBD

---

## Risks

### Risk 1

Description: [TBD]

Mitigation: [TBD]

---

## Guiding Principles

1. Human governance first
2. Contracts before implementation
3. Architecture before coding
4. Validation before merge
5. Integration before release
6. Explicit documentation over assumptions

---

## Project Scope

**In Scope:**
- [TBD]

**Out of Scope:**
- [TBD]

---

## Governance

See `GOVERNANCE_CORE.md` for file ownership and the relationship between documents.

Changes to this roadmap require:
1. Conductor review
2. Rationale
3. Impact analysis
4. Documentation update

Workers may not modify ROADMAP.md. Dev may edit directly (see GOVERNANCE_CORE.md), logged in DEV_LOG.md.

---

## Final Statement

**ROADMAP.md** is the source of truth for project direction.

**PIPELINE.md** is the source of truth for project execution.

See `GOVERNANCE_CORE.md` for authority order.
