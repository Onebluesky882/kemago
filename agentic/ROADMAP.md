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
