import { Hono } from 'hono'
import { createDb, forumPosts, forumReplies, user, eq, desc, FORUM_CATEGORIES } from '@gover-agent/db'
import type { ForumCategory } from '@gover-agent/db'
import { createAuth } from '@gover-agent/auth'
import { sendNotificationEmail } from '@gover-agent/email'

type Bindings = { DB: D1Database; RESEND_API_KEY: string }

const forumRouter = new Hono<{ Bindings: Bindings }>()

async function getSession(c: { env: Bindings; req: { raw: Request } }) {
  const db = createDb(c.env.DB)
  const auth = createAuth(db)
  return auth.api.getSession({ headers: c.req.raw.headers })
}

// List posts — optional ?category= filter, pinned first then latest
forumRouter.get('/', async (c) => {
  const category = c.req.query('category') as ForumCategory | undefined
  const db = createDb(c.env.DB)
  const posts = await db.query.forumPosts.findMany({
    where: category && FORUM_CATEGORIES.includes(category) ? eq(forumPosts.category, category) : undefined,
    orderBy: [desc(forumPosts.isPinned), desc(forumPosts.createdAt)],
    with: { user: { columns: { id: true, name: true } } },
  })
  return c.json(posts)
})

// Get single post with replies
forumRouter.get('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const post = await db.query.forumPosts.findFirst({
    where: eq(forumPosts.id, c.req.param('id')),
    with: {
      user: { columns: { id: true, name: true } },
      forumReplies: {
        orderBy: [desc(forumReplies.createdAt)],
        with: { user: { columns: { id: true, name: true } } },
      },
    },
  })
  if (!post) return c.json({ error: 'Not found' }, 404)
  return c.json(post)
})

// Create post — requires auth
forumRouter.post('/', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const { title, body, category, imageUrl } = await c.req.json<{ title: string; body: string; category?: string; imageUrl?: string }>()
  if (!title?.trim() || !body?.trim()) return c.json({ error: 'Missing fields' }, 400)

  const safeCategory: ForumCategory = FORUM_CATEGORIES.includes(category as ForumCategory)
    ? (category as ForumCategory)
    : 'general'

  const db = createDb(c.env.DB)
  const postNumber = 1000000 + Math.floor(Math.random() * 9000000)
  const post = {
    id: crypto.randomUUID(),
    postNumber,
    title: title.trim(),
    body: body.trim(),
    category: safeCategory,
    isPinned: false,
    imageUrl: imageUrl ?? null,
    userId: session.user.id,
    createdAt: new Date(),
  }
  await db.insert(forumPosts).values(post)
  return c.json({ success: true, post })
})

// Reply to post — requires auth + notify participants
forumRouter.post('/:id/reply', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const { body, parentReplyId, imageUrl } = await c.req.json<{ body: string; parentReplyId?: string; imageUrl?: string }>()
  if (!body?.trim()) return c.json({ error: 'Missing body' }, 400)

  const postId = c.req.param('id')
  const db = createDb(c.env.DB)

  // Insert reply
  const reply = {
    id: crypto.randomUUID(),
    body: body.trim(),
    postId,
    parentReplyId: parentReplyId ?? null,
    imageUrl: imageUrl ?? null,
    userId: session.user.id,
    createdAt: new Date(),
  }
  await db.insert(forumReplies).values(reply)

  // Notify participants in background (don't await — don't block response)
  c.executionCtx.waitUntil(
    notifyParticipants({
      db: createDb(c.env.DB),
      postId,
      replierId: session.user.id,
      replierName: session.user.name,
      resendApiKey: c.env.RESEND_API_KEY,
    })
  )

  return c.json({ success: true, reply })
})

async function notifyParticipants({
  db, postId, replierId, replierName, resendApiKey,
}: {
  db: ReturnType<typeof createDb>
  postId: string
  replierId: string
  replierName: string
  resendApiKey: string
}) {
  try {
    // Get post with author
    const post = await db.query.forumPosts.findFirst({
      where: eq(forumPosts.id, postId),
      with: { user: { columns: { id: true, name: true, email: true } } },
    })
    if (!post) return

    // Get all repliers
    const replies = await db.query.forumReplies.findMany({
      where: eq(forumReplies.postId, postId),
      with: { user: { columns: { id: true, name: true, email: true } } },
    })

    // Collect unique participants (exclude the person who just replied)
    const seen = new Set<string>()
    const participants: { id: string; name: string; email: string }[] = []

    const postUser = post.user as { id: string; name: string; email: string }
    if (postUser.id !== replierId && !seen.has(postUser.id)) {
      seen.add(postUser.id)
      participants.push(postUser)
    }

    for (const r of replies) {
      const u = r.user as { id: string; name: string; email: string }
      if (u.id !== replierId && !seen.has(u.id)) {
        seen.add(u.id)
        participants.push(u)
      }
    }

    const postUrl = `https://fullstack-builder-web.onebluesky882.workers.dev/forum/${postId}`

    await Promise.allSettled(
      participants.map(p =>
        sendNotificationEmail({
          to: p.email,
          name: p.name,
          subject: `New reply in "${post.title}"`,
          message: `<b>${replierName}</b> replied to a post you participated in.<br><br><a href="${postUrl}" style="color:#7c3aed;font-weight:600">View the reply →</a>`,
          resendApiKey,
        })
      )
    )
  } catch {
    // Notification failure must never break the reply
  }
}

export { forumRouter }
