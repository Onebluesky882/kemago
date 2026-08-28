# apps/mobile — TODO

Checklist for the mobile app, grouped by feature area. Update the status when a section's scope changes — don't leave it stale.

Legend: `[x]` done · `[~]` partial / mocked · `[ ]` not started

---

## Tab shell & navigation
- [x] expo-router tabs: Feed, Events, Jobs, Sport, Clubs, Chat, Profile
- [x] SVG tab icons (no emoji, per CLAUDE.md)
- [ ] 7 tabs may be too many for a bottom bar at real device width — revisit grouping (e.g. fold Jobs/Sport/Clubs under one "Discover" tab) once seen on device

## Feed
- [x] List posts, filter by category (chips)
- [x] Compose + post, reads/writes through local-first store (`lib/db/postsRepo`)
- [x] Verified badge next to author
- [ ] Like / reply actions (UI only, no persistence yet)
- [ ] Wire to `POST/GET /v1/feed` once Go backend exists (stage-7-feed)

## Events
- [x] List events, verified badge next to host
- [ ] Join/RSVP action
- [ ] Create event flow
- [ ] Wire to `GET/POST /v1/events`, `POST /v1/events/:id/join` (stage-8-event)

## Jobs & Announcements
- [x] List screen + card (Job vs Announcement badge, verified badge)
- [ ] Compose/create flow
- [ ] Backend + contract not yet defined in CONTRACTS.md — needs a stage before this is real

## Sport
- [x] List screen + card (sport tag, spots left, verified badge)
- [ ] Join/RSVP action
- [ ] Compose/create flow
- [ ] Backend + contract not yet defined in CONTRACTS.md — needs a stage before this is real

## My Clubs
- [x] List screen + card (joined state, member count)
- [ ] Join/leave action
- [ ] Browse-all-clubs (vs. "my clubs") view
- [ ] Backend + contract not yet defined in CONTRACTS.md — needs a stage before this is real

## Auth (sign-in / sign-up)
- [x] Phone-only flow — no separate signup/signin, `UpsertVerifiedUser` on the backend handles both: `(auth)/signin.tsx` (phone entry) → `(auth)/verify.tsx` (6-digit code) → real JWT from `backend/api-go`'s `/api/otp/*`
- [x] `lib/api/authApi.ts` — `requestOtp`/`verifyOtp` against `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:3000`; needs an override for Android emulator/physical device — see `lib/api/config.ts`)
- [x] Session (`token`, `phone`, `isAuthenticated`) persisted via `useAuthStore` + zustand `persist` (MMKV/localStorage) — explicit product decision to keep it simple, not expo-secure-store
- [x] Root `_layout.tsx` `AuthGate` — waits for persist hydration, redirects signed-out users to `(auth)/signin` and signed-in users away from the `(auth)` group; `app/index.tsx` gives `/` an unambiguous entry now that both `(auth)` and `(tabs)` groups exist
- [x] Resend-code cooldown UI matches the backend's actual 60s cooldown
- [ ] **Not yet run against a real device/simulator** — only `tsc` type-checked, no live Expo session verified the redirect flow or a real end-to-end sign-in
- [ ] No sign-out UI anywhere yet (`useAuthStore.signOut()` exists but nothing calls it)
- [ ] Token stored in plaintext MMKV/localStorage per explicit direction — move to expo-secure-store (Keychain/Keystore) if this needs to harden past MVP
- [ ] No token expiry handling — a 401 from an authenticated request doesn't currently sign the user out or refresh anything (no refresh tokens exist yet either, see `backend/TODO.md`)

## Chat
- [x] Conversation list (mock data)
- [ ] Thread/message view
- [ ] Wire to `GET /v1/chats`, `GET/POST /v1/chats/:id/messages` (stage-10-chat)
- [ ] Real-time transport — separate WebSocket service being scaffolded backend-side

## Profile
- [x] Header (avatar-as-initials, name, verified badge), stats row
- [x] Private/public visibility toggle, persisted on-device (`useAuthStore` + zustand `persist`, MMKV/localStorage)
- [ ] Edit profile fields
- [ ] Sync isPublic to `PATCH /v1/users/me` once backend exists (stage-9-profile) — device storage is the source of truth until then
- [x] Real auth now exists (see Auth section) — token IS in this persisted store, per explicit direction (not the secure-keychain approach originally planned here)

## Local-first data layer (`lib/db/`, `lib/sync/`)
- [x] `postsRepo.native.ts` — react-native-nitro-sqlite, schema + migrate + seed
- [x] `postsRepo.web.ts` — localStorage equivalent, same function shapes (nitro-sqlite has no web build)
- [x] `sync_outbox` table capturing local writes
- [x] `syncEngine.runBackgroundSync()` — currently just reports pending outbox count
- [ ] Extend repo pattern to Events/Jobs/Sport/Clubs (only Feed is wired so far)
- [ ] Real sync: drain outbox against a live API once one exists
- [ ] Conflict resolution strategy (not designed yet — fine while there's no server writer)

## Global product rules (see also memory: coarea-product-rules)
- [x] No avatar upload anywhere — initials-only `Avatar` component
- [x] Verified badge surfaced wherever a user/poster/host is shown
- [x] Private/public profile toggle exists (Profile screen)
- [ ] Identity verification flow itself (face-scan) — open-source library not yet chosen
- [ ] AI moderation before publish — blocked on the user supplying a prohibited-content list

## Platform-specific files
- [x] `lib/db/postsRepo.*` and `lib/storage/zustandStorage.*` are the only splits so far (genuine native-vs-web divergence — nitro-sqlite and MMKV are native-only NitroModules)
- [x] Each has a bare fallback (`postsRepo.ts`, `zustandStorage.ts`) that just re-exports `.native` — lets `tsc` resolve the extensionless import without a `moduleSuffixes` tsconfig change (that approach was tried and reverted: it broke NativeWind's `className` prop typing project-wide)
- [ ] Do not split any other component/module unless it hits the same kind of real platform divergence (see memory: coarea-mobile-platform-files)

## Known bugs fixed this pass
- [x] `FeedScreen.handlePost` no longer hardcodes category "General" — uses the active filter
- [x] `Card.tsx` press-animation could be silently overridden by a caller's `style` prop — fixed spread order
- [x] `useComposePost.submit` now actually awaits `onSubmit`, so the double-submit guard is real
