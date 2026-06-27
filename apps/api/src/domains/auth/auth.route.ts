import { Hono } from 'hono'
import { createAuth } from '@gover-agent/auth'
import { createDb } from '@gover-agent/db'

const authRouter = new Hono<{ Bindings: { DB: D1Database; OWNER_EMAIL: string } }>()

authRouter.all('/*', async (c) => {
  const db = createDb(c.env.DB)
  const auth = createAuth(db, [
    'http://localhost:3000',
    'http://localhost:3001',
    '',
    '',
  ], c.env.OWNER_EMAIL)
  return auth.handler(c.req.raw)
})

export { authRouter }
