Stage Task: stage-7-admin-ui

Gate-In Verified: YES
Status: IN_PROGRESS
Assigned To: Worker Agent
Domain: apps/admin

---

## Objective

Replace all mock data in the admin dashboard with real data from the API.
Add file upload via R2 presigned URLs. Protect all dashboard routes with session auth.

---

## Required Reading

Before starting, read:
- agentic/START_HERE.md
- agentic/AGENT_RULES.md
- agentic/ARCHITECTURE.md
- agentic/DECISIONS.md

---

## Scope

You may ONLY modify files inside `apps/admin/`.
Do NOT touch apps/web, apps/api, packages/*, or any agentic/ files.

---

## API Endpoints Available

All requests use NEXT_PUBLIC_API_URL from .env.local (http://localhost:8787 in dev).
All requests must include `credentials: 'include'` for session cookies.

- GET  /api/user/me               → current user
- GET  /health                    → { status, timestamp }
- POST /api/storage/presign/upload → { url, key } — presigned upload URL
- POST /api/storage/presign/download → { url, key } — presigned download URL
- DELETE /api/storage/file        → delete file by key
- GET  /api/storage/files         → list files (optional ?prefix=)
- POST /api/email/notify          → send notification email

---

## Deliverables

### 1. Session Protection — app/(dashboard)/layout.tsx

Already has useSession + redirect logic (from stage-2-auth).
Verify it correctly:
- Shows loading spinner while isLoading is true
- Redirects to /login if user is null after loading completes
- Renders children if user is present

### 2. Dashboard Home — app/(dashboard)/dashboard/page.tsx

Replace mock stat cards with real data.

Architecture:
- hooks/use-dashboard.ts — fetch /health + /api/user/me, return { apiStatus, currentUser, isLoading }
- components/dashboard/stat-card.tsx — pure component: { label, value, status? }
- components/dashboard/stats-grid.tsx — pure component: renders 4 StatCards from props
- page.tsx — use hook, pass data to StatsGrid

Stats to show:
- API Status (from /health — "online" or "offline")
- Logged in as (from /api/user/me — show user email)
- Storage (static "R2 Connected" for now)
- DB (static "D1 Connected" for now)

### 3. Storage Page — app/(dashboard)/storage/page.tsx

Replace mock file list with real R2 data + upload UI.

Architecture:
- hooks/use-storage.ts — fetch file list, generate presigned URLs, handle upload/delete
- components/storage/file-list.tsx — pure component: { files, onDelete, onDownload }
- components/storage/file-row.tsx — pure component: { file, onDelete, onDownload }
- components/storage/upload-button.tsx — pure component: { onFileSelect, isUploading }
- page.tsx — use hook, pass to components

Upload flow:
1. User selects file via input
2. hook calls POST /api/storage/presign/upload with { key: filename, contentType }
3. hook receives presigned URL
4. hook does PUT presigned URL with file binary — direct to R2, NOT through server
5. hook refetches file list

### 4. Users Page — app/(dashboard)/users/page.tsx

Replace mock table with real user data.

Architecture:
- hooks/use-users.ts — fetch /api/user/me (expand in future stages), return { users, isLoading }
- components/users/user-table.tsx — pure component: { users }
- components/users/user-row.tsx — pure component: { user }
- page.tsx — use hook, pass to components

For now, show only the current logged-in user (single row).
Table columns: Name, Email, Created At, Status

### 5. Emails Page — app/(dashboard)/emails/page.tsx

Keep as informational page for now (no real email log API yet).
Replace mock data with a note: "Email logs will appear here after emails are sent."
Add a "Send Test Email" button that calls POST /api/email/notify with test data.

Architecture:
- hooks/use-emails.ts — handle send test email action
- components/emails/email-log.tsx — pure component: { message }
- components/emails/send-test-button.tsx — pure component: { onSend, isLoading }
- page.tsx — use hook, pass to components

### 6. Settings Page — app/(dashboard)/settings/page.tsx

Show current user info. Allow display name update (UI only, API in future stage).

Architecture:
- hooks/use-settings.ts — read from auth.store, handle form state
- components/settings/profile-form.tsx — pure component: { user, onSubmit, isLoading }
- page.tsx — use hook, pass to components

---

## Architecture Rules

Follow the 4-layer pattern strictly:
- `components/` — pure UI, props only, no store access, no fetch calls
- `hooks/` — business logic, state, fetch calls
- `store/` — Zustand global state only (do not add new stores unless necessary)
- `app/page.tsx` — orchestrate hook + components, pass results as props

---

## Acceptance Criteria

- [ ] All dashboard pages redirect to /login when no session
- [ ] Dashboard home shows real API health status
- [ ] Storage page lists real files from R2
- [ ] Storage page can upload a file via presigned URL (client → R2 directly)
- [ ] Storage page can delete a file
- [ ] Users page shows current logged-in user
- [ ] Emails page has working "Send Test Email" button
- [ ] Settings page shows current user profile
- [ ] No TypeScript errors (tsc --noEmit passes)
- [ ] All components are pure (no direct fetch or store access inside components/)

---

## Completion

When done, create: agentic/gate-out/stage-7-admin-ui.md
