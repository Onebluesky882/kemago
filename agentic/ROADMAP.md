---
status: DRAFT
owner: CONDUCTOR
last_updated: 2026-07-18
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

Coarea is a local-first social app: a single place for people to see what's happening nearby — local news, community activity, and events — and to easily join in. First version ships as a mobile app.

---

## Problem Statement

What problem does this project solve?

- General social apps mix everyone together — it's hard to find what's actually happening near you
- People miss local events, deals, and news because there's no single place to look
- Neighbors have no easy way to find and join local activities together

---

## Business Goals

### Goal 1

Description: Get people using the app to see and share what's happening in their area.

Success Criteria:
- [ ] Mobile app live on the App Store and Google Play
- [ ] People can post updates and browse local activity
- [ ] People can find and join local events

### Goal 2

Description: Grow the number of people actively using the app in a given area.

Success Criteria:
- [ ] Steady growth in new sign-ups
- [ ] People come back and use the app regularly
- [ ] People are posting and joining events, not just browsing

---

## Strategic Objectives

### Objective 1

Description: Ship a simple, working mobile app fast — four core areas: Feed, Events, Profile, Chat.

Success Indicators:
- [ ] Feed, Events, Profile, and Chat are all working
- [ ] Login and account creation work smoothly
- [ ] App feels fast and easy to use

### Objective 2

Description: Keep the technical foundation simple and self-hosted, so it's cheap to run early on.

Success Indicators:
- [ ] Backend runs reliably on self-hosted infrastructure
- [ ] No unnecessary paid cloud services in the early stage
- [ ] Easy to move to bigger hosting later if the app grows

---

## Current Progress

<!-- Conductor updates this section to summarize, in plain language, what has been delivered so far. -->

- Project setup is complete: what Coarea is, who it's for, and how it will be built has been agreed and written down
- The bank-slip verification helper (checks payment QR codes) has been rewritten in the same programming language as the rest of the app, so it's easier to maintain going forward. No change to how it behaves.
- The project's build tools and the styling library used on the website, admin panel, and mobile app were all updated to their newest versions.
- Decided the mobile app comes first, with its own backend server that runs on your own computer for now (instead of paid cloud hosting) — keeps early costs low
- The app's four main screens are built and working: Feed, Events, Chat, and Profile, with bottom-tab navigation between them. Right now they show sample neighborhood content (not real data yet) so the look and feel can be reviewed before the real server is connected

---

## Milestone Backlog

Milestones may be added, removed, reordered, or refined by the Conductor.

| ID | Name | Goal | Status |
|----|------|------|--------|
| M-001 | Backend foundation | Get the server and database running | PLANNING |
| M-002 | Login and accounts | People can create an account and log in | PLANNING |
| M-003 | App screens ready | Feed, Events, Profile, and Chat screens are built | COMPLETE |
| M-004 | Feed working | People can post and browse local updates | PLANNING |
| M-005 | Events working | People can find, create, and join local events | PLANNING |
| M-006 | Profile working | People can view and edit their profile | PLANNING |
| M-007 | Chat working | People can message each other | PLANNING |

**Status values:** PLANNING · APPROVED · IN_PROGRESS · COMPLETE · CANCELLED

---

## Next Steps

<!-- Conductor updates this section to summarize, in plain language, what happens next. -->

- Build the server that will power the app (backend foundation)
- Build the basic app screens: Feed, Events, Profile, Chat
- Add login and account creation

---

## Success Metrics

The project will be considered successful when:
- [ ] The mobile app is live on the App Store and Google Play
- [ ] People can sign up, post, browse events, and chat without issues
- [ ] People are actively coming back and using the app

---

## Risks

### Risk 1

Description: The backend runs on your own computer (self-hosted) for now, not a cloud service — if that computer is off or loses internet, the app goes down.

Mitigation: Fine for early testing/development; move to a proper server or cloud host before inviting real users at scale.

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
- Mobile app (Feed, Events, Profile, Chat)
- Self-hosted backend server and database

**Out of Scope (for now):**
- Website and admin panel (`apps/web`, `apps/admin`) — revisit once the mobile app is live
- Cloud hosting for the backend — using your own computer for now

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
