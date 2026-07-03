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
- Started building a new "Monitor" section in the admin panel — an overview page plus dedicated pages for cost, system health, and error tracking, styled like a technology monitoring dashboard.
- Redesigned the admin login page and the whole admin panel to support both light mode and dark mode with a switch to toggle between them.
- While testing the login page, found a real issue: staff logins may not stay signed in correctly once the admin panel and the backend are hosted on separate web addresses (the normal setup for a live deployment). This needs to be fixed before the admin panel goes live — flagged for the next update.

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

- Fix the login session issue found during testing so staff logins stay reliable on a live deployment.
- Finish the new Monitor pages (cost, system health, errors) and connect them to the admin menu.

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
