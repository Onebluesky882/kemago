import { Hono } from 'hono'
import { createAuth } from '@gover-agent/auth'
import { createDb } from '@gover-agent/db'
import { getMe } from './user.handler'

type Bindings = { DB: D1Database; ALLOWED_ORIGINS: string }

const userRouter = new Hono<{ Bindings: Bindings }>()

userRouter.get('/me', async (c) => {
  const db = createDb(c.env.DB)
  const extra = (c.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean)
  const auth = createAuth(db, ['http://localhost:3000', 'http://localhost:3001', ...extra])
  return getMe(c, auth)
})

export { userRouter }
