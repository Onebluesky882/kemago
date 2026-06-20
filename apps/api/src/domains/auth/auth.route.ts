import { Hono } from 'hono'
import { createAuth } from '@gover-agent/auth'
import { createDb } from '@gover-agent/db'

const authRouter = new Hono<{ Bindings: { DB: D1Database } }>()

authRouter.all('/*', async (c) => {
  const db = createDb(c.env.DB)
  const auth = createAuth(db, [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://fullstack-builder-web.onebluesky882.workers.dev',
    'https://fullstack-builder-admin.onebluesky882.workers.dev',
  ])
  return auth.handler(c.req.raw)
})

export { authRouter }
