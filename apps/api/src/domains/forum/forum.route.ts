import { Hono } from 'hono'
import { createDb, forumPosts, forumReplies, eq, desc, FORUM_CATEGORIES } from '@gover-agent/db'
import type { ForumCategory } from '@gover-agent/db'
import { createAuth } from '@gover-agent/auth'

type Bindings = { DB: D1Database }

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

// Get single post with replies (oldest reply first)
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

  const { title, body, category } = await c.req.json<{ title: string; body: string; category?: string }>()
  if (!title?.trim() || !body?.trim()) return c.json({ error: 'Missing fields' }, 400)

  const safeCategory: ForumCategory = FORUM_CATEGORIES.includes(category as ForumCategory)
    ? (category as ForumCategory)
    : 'general'

  const db = createDb(c.env.DB)
  const post = {
    id: crypto.randomUUID(),
    title: title.trim(),
    body: body.trim(),
    category: safeCategory,
    isPinned: false,
    userId: session.user.id,
    createdAt: new Date(),
  }
  await db.insert(forumPosts).values(post)
  return c.json({ success: true, post })
})

// Reply to post — requires auth
forumRouter.post('/:id/reply', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const { body } = await c.req.json<{ body: string }>()
  if (!body?.trim()) return c.json({ error: 'Missing body' }, 400)

  const db = createDb(c.env.DB)
  const reply = {
    id: crypto.randomUUID(),
    body: body.trim(),
    postId: c.req.param('id'),
    userId: session.user.id,
    createdAt: new Date(),
  }
  await db.insert(forumReplies).values(reply)
  return c.json({ success: true, reply })
})

export { forumRouter }
