# Agent Rules

## File Location Rules — NEVER VIOLATE

**All governance files MUST live inside `agentic/`. Never create or modify governance files at the project root.**

Files allowed at root: `CLAUDE.md`, `README.md`, and code directories (`apps/`, `packages/`, config files).

If you find any governance file at root (e.g. `PIPELINE.md`, `AGENT_RULES.md`, `START_HERE.md`), do NOT use it — read from `agentic/` instead.

---

## WebSocket / Realtime — When Client Needs It

WebSocket on Cloudflare Workers requires **Durable Objects** which is NOT on the free tier ($5/month minimum).

**Do NOT add WebSocket by default.** Only add when client explicitly needs realtime features like:
- Live chat
- Realtime notifications (badge count updates)
- Live score / sensor data stream
- Collaborative editing

### When client requests WebSocket:

1. Upgrade Cloudflare plan to Paid ($5/mo)
2. Create a Durable Object class in `apps/api/src/domains/realtime/`
3. Add `[[durable_objects]]` binding in `wrangler.toml`
4. Connect from client via native `WebSocket` API

### Alternative — No WebSocket needed for:
- Forum new post notifications → use **email** (Resend) ✅
- Dashboard data refresh → use **polling** every 30s ✅
- Order status update → use **email/webhook** ✅

---

## Cross-Domain Auth — NEVER USE credentials: 'include' for Mutation Requests

**`workers.dev` is in the Public Suffix List — cross-subdomain cookies DO NOT WORK between `fullstack-builder-web.workers.dev` and `fullstack-builder-api.workers.dev`.**

### Root cause
Better Auth does NOT support `Authorization: Bearer` by default. Must enable the `bearer` plugin:

```ts
// packages/auth/src/auth.ts
import { bearer } from 'better-auth/plugins'

betterAuth({
  plugins: [bearer()],  // ← REQUIRED for cross-domain token auth
  ...
})
```

Without `bearer()` plugin → `getSession()` ignores the Authorization header → always returns null → Forbidden/Unauthorized.

### Rule
- `credentials: 'include'` works for GET requests (read-only) but NOT for POST/PATCH/DELETE that require auth
- Always use `useApi()` hook from `@/hooks/use-api` for authenticated mutation requests — it sends `Authorization: Bearer <token>` automatically

```ts
// ❌ WRONG — cookie won't be sent cross-domain for mutations
fetch(`${API}/api/forum`, {
  method: 'POST',
  credentials: 'include',
  ...
})

// ✅ CORRECT — uses Bearer token
const { apiFetch } = useApi()
apiFetch('/api/forum', { method: 'POST', body: JSON.stringify({...}) })
```

- Token is stored in Zustand (`auth.token`) and persisted to localStorage
- Token is set automatically on sign-in/sign-up in `useAuth()`
- Better Auth validates `Authorization: Bearer <token>` header natively

---

## Secret Environment Variables — MUST SET BEFORE DEPLOY

**Every time you add a new env var that contains a secret (API key, token, password), you MUST instruct the client to run `wrangler secret put` before deploying.**

Never leave secrets as empty strings in `wrangler.toml`. Empty strings in `wrangler.toml` are placeholders only — the real value must be set as a Cloudflare secret.

### Required secrets for this project

| Secret name | Service | Command |
|------------|---------|---------|
| `RESEND_API_KEY` | Resend email | `wrangler secret put RESEND_API_KEY` |
| `STRIPE_SECRET_KEY` | Stripe payments | `wrangler secret put STRIPE_SECRET_KEY` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks | `wrangler secret put STRIPE_WEBHOOK_SECRET` |
| `GITHUB_TOKEN` | GitHub invite | `wrangler secret put GITHUB_TOKEN` |
| `R2_ACCESS_KEY_ID` | R2 storage | `wrangler secret put R2_ACCESS_KEY_ID` |
| `R2_SECRET_ACCESS_KEY` | R2 storage | `wrangler secret put R2_SECRET_ACCESS_KEY` |

### Rule — when adding a new secret

1. Add placeholder `""` in `wrangler.toml` for documentation only
2. Add to the table above
3. Tell the client exactly which command to run:

```bash
cd apps/api && wrangler secret put YOUR_SECRET_NAME
```

4. Verify it's set — after deploy, check the binding list. A secret set correctly shows the name without `("")`.

**If `wrangler deploy` output shows `env.SOME_KEY ("")` → the secret is NOT set. Tell the client to run `wrangler secret put SOME_KEY` immediately.**

---

## Client Type Detection — ENFORCED BY HOOK

**A `.claude/hooks/client-type-check.sh` hook blocks ALL Write/Edit to source files until `agentic/CLIENT_TYPE.md` exists with a valid value.**

### To create the file:

After asking the client which type they are, create:

```bash
# For developer / conductor workflow:
echo "DEVELOPER" > agentic/CLIENT_TYPE.md

# For non-technical business owner:
echo "CLIENT" > agentic/CLIENT_TYPE.md
```

Valid values: `DEVELOPER` or `CLIENT` (case-insensitive)

---

## Client Type Detection — MANDATORY FIRST STEP

**Before doing ANYTHING, the Conductor MUST identify who it is talking to.**

Ask this exact question first (in the language they write in):

> "สวัสดีครับ ก่อนเริ่มต้น ขอถามก่อนนะครับ — คุณเป็นนักพัฒนา (developer) หรือเจ้าของธุรกิจที่ต้องการสร้างเว็บไซต์?"
>
> (English version: "Hi! Before we begin — are you a developer setting up the system, or a business owner who wants to build a website?")

---

### If DEVELOPER / Conductor → use `QUESTIONS.md`
- Ask technical questions (tech stack, architecture, pipeline stages)
- Use developer terminology freely

### If NON-TECHNICAL CLIENT (business owner, buyer) → use `CUSTOMER_SETUP.md`
- NEVER use technical terms
- Ask only about their business, not about code
- Follow ALL rules in `agentic/CUSTOMER_SETUP.md`
- Key rules:
  - Explain everything with real-life analogies
  - Reply in the same language the client uses
  - Ask ONE question at a time
  - Never assume — always confirm before proceeding
  - Summarize back before building anything

**Wrong approach (❌):**
> "กรุณากรอก tech stack และ deployment platform ที่ต้องการ"

**Correct approach (✅):**
> "เว็บไซต์ของคุณต้องการอะไรบ้างครับ? เช่น ขายสินค้า รับจอง หรือแสดงข้อมูลธุรกิจ?"

---

## Frontend Navigation Rules — NEVER VIOLATE

**NEVER use `<a href>` for internal links in `apps/web` or `apps/admin`.**

Internal navigation must use:
- `<Link href="...">` from `next/link` — for static links in JSX
- `router.push("...")` from `useRouter` — for programmatic navigation

`<a>` tags are ONLY allowed for:
- External URLs (`https://...`)
- Email links (`mailto:...`)

Reason: `<a>` causes full page reload which resets global auth state and causes header flash.

---

## Auth Session Global Rules — NEVER VIOLATE

**NEVER write a custom `<nav>` inside any page in `apps/web`.**

Every page MUST use the shared `<Navbar>` component from `@/components/navbar`:

```tsx
import { Navbar } from '@/components/navbar'

export default function SomePage() {
  return (
    <div>
      <Navbar />
      ...
    </div>
  )
}
```

**Why:** Pages with their own hard-coded nav always show "Sign in" regardless of auth state — the shared `<Navbar>` reads from Zustand global store which persists across all pages.

**Auth state rules:**
- Global auth state lives in `useAuthStore` (Zustand + localStorage persist)
- `AuthProvider` in `layout.tsx` verifies session with API once on app load
- `onRehydrateStorage` sets `isLoading: false` immediately from localStorage — prevents flash
- NEVER duplicate auth fetch logic inside individual pages or components

---

## R2 Bucket Setup Rules — MUST DO BEFORE IMAGE UPLOAD WORKS

**Before image upload can work in production, the client MUST set these secrets:**

```bash
cd apps/api
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
```

**After setting R2 secrets, client MUST also configure R2 CORS for browser uploads:**

Go to Cloudflare Dashboard → R2 → `fullstack-builder-storage` → Settings → CORS Policy → add:
```json
[
  {
    "AllowedOrigins": ["https://fullstack-builder-web.onebluesky882.workers.dev", "http://localhost:3000"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["Content-Type", "x-amz-checksum-crc32", "x-amz-sdk-checksum-algorithm"],
    "MaxAgeSeconds": 3600
  }
]
```
Without this, browser uploads fail with "Image upload failed" even though API keys are correct.

**How to get R2 API credentials:**
1. Cloudflare Dashboard → R2 → Manage R2 API Tokens
2. Create token with **Object Read & Write** permission on bucket `fullstack-builder-storage`
3. Copy Access Key ID → `wrangler secret put R2_ACCESS_KEY_ID`
4. Copy Secret Access Key → `wrangler secret put R2_SECRET_ACCESS_KEY`

**Image URL storage pattern:**
- Images are stored in R2, URL saved in `image_url` column of the content table
- Upload flow: Client → `POST /api/storage/presign/upload` → PUT to R2 → `POST /api/storage/presign/download` → save URL
- Current download URL expires in 7 days (604800 seconds)
- For permanent URLs: enable R2 public bucket access in Cloudflare Dashboard

**R2 key naming convention:**
```
forum/{uuid}.webp          ← post images
forum/replies/{uuid}.webp  ← reply images
admin/{uuid}.webp          ← admin uploads
```

---

## Image / Media Attachment Rules

**Any content table (forum_posts, forum_replies, or future content tables) MUST have an `image_url TEXT` column ready.**

This column stores the R2 public URL of an uploaded image. It is nullable — no image = NULL.

### Upload flow (presigned URL pattern)
1. Client requests presigned upload URL: `POST /api/storage/upload-url` → `{ url, key, publicUrl }`
2. Client uploads directly to R2: `PUT presignedUrl` with the file blob
3. Client saves `publicUrl` to the content record on submit

### Render rule
When rendering content body, check `imageUrl`:
```tsx
{post.imageUrl && (
  <img src={post.imageUrl} alt="" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 12 }} />
)}
```

### Naming convention
- DB column: `image_url TEXT`
- API field: `imageUrl`
- R2 key pattern: `forum/{postId}/{uuid}.webp`

### Image optimization (client-side before upload)
Convert to WebP and resize using Canvas before uploading to R2:
- Max width: 1200px
- Quality: 0.85
- Format: WebP

---

## Notification Service Rules

**`sendNotificationEmail` is ready in `@gover-agent/email` — use it whenever a domain needs to notify users.**

```ts
import { sendNotificationEmail } from '@gover-agent/email'

await sendNotificationEmail({
  to: user.email,
  name: user.name,
  subject: 'Subject here',
  message: 'HTML message body here',
  resendApiKey: c.env.RESEND_API_KEY,
})
```

**Rules:**
- Always run notifications via `c.executionCtx.waitUntil(...)` — never block the API response
- Always wrap in `Promise.allSettled` when sending to multiple recipients — one failure must not block others
- Never throw from the notification function — catch all errors silently so the main operation always succeeds
- Deduplicate recipients by `userId` before sending
- Exclude the actor (the person who triggered the event) from recipients

**When to send notifications:**
| Event | Recipients |
|-------|-----------|
| New reply on forum post | Post author + all previous repliers |
| New forum post (future) | Subscribers of that category |
| Payment success | Buyer |
| Any domain event | Participants of that resource |

---

## CRUD Domain Testing Rules — NEVER SKIP

**Every time you create or modify a CRUD domain (API route + DB table), you MUST:**

### Step 1 — Insert test row
```bash
wrangler d1 execute fullstack-builder-db --remote --command="INSERT INTO <table> (...) VALUES (...)"
```

### Step 2 — Test each operation
Test all operations that were implemented:
- **CREATE** — POST endpoint returns `{ success: true }`
- **READ** — GET endpoint returns the row
- **UPDATE** — PUT/PATCH endpoint updates correctly
- **DELETE** — DELETE endpoint removes the row

### Step 3 — Report result
Output a checklist before cleanup:
```
✅ CREATE — POST /api/forum → { success: true }
✅ READ   — GET /api/forum → returns post with user
✅ REPLY  — POST /api/forum/:id/reply → { success: true }
```

### Step 4 — Delete test rows (MANDATORY)
After confirming success, delete ALL test data:
```bash
wrangler d1 execute fullstack-builder-db --remote --command="DELETE FROM <table> WHERE id='test-xxx'"
```

**Never leave test rows in the production database.**

---

## Before Starting Any Task

**MANDATORY — Every agent must read `agentic/START_HERE.md` before doing anything else. No exceptions.**

**For any UI/frontend task: also read `agentic/DESIGN_SYSTEM.md` before writing a single line of UI code.**

If you are a worker agent assigned to a PIPELINE.md stage:
1. Read agentic/START_HERE.md first
2. Read agentic/AGENT_RULES.md
3. Confirm your assigned stage's `agentic/tasks/stage-XX-<name>.md` has Status: READY/IN_PROGRESS before beginning work

## ADR Numbering

**MANDATORY — do this before creating any ADR, no exceptions:**

```bash
ls agentic/docs/adrs/ | sort | tail -3
```

Take the highest number shown, add 1, use that as your ADR number.

Rules:
- Never guess or assume the next number
- Never create a file without running the check above first
- File name: `NNN-short-slug.md` (zero-padded to 3 digits)
- Header inside the file must match the filename exactly:
  ```
  # ADR NNN — Title
  ```
- This rule applies in every worktree — the `agentic/docs/adrs/` directory is shared via git
