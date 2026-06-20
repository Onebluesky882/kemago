import { Hono } from 'hono'
import { createAuth } from '@gover-agent/auth'
import { createDb } from '@gover-agent/db'

const authRouter = new Hono<{ Bindings: { DB: D1Database } }>()

authRouter.all('/*', async (c) => {
  const db = createDb(c.env.DB)
  const auth = createAuth(db)
  return auth.handler(c.req.raw)
})

export { authRouter }
