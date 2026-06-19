import { Hono } from 'hono'
import { createAuth } from '@fullstack-builder/auth'
import { createDb } from '@fullstack-builder/db'

const authRouter = new Hono<{ Bindings: { DB: D1Database } }>()

authRouter.all('/*', async (c) => {
  const db = createDb(c.env.DB)
  const auth = createAuth(db)
  return auth.handler(c.req.raw)
})

export { authRouter }
