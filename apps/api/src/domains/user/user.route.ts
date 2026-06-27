import { Hono } from 'hono'
import { createAuth } from '@gover-agent/auth'
import { createDb } from '@gover-agent/db'
import { getMe } from './user.handler'

const userRouter = new Hono<{ Bindings: { DB: D1Database } }>()

const TRUSTED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  '',
  '',
]

userRouter.get('/me', async (c) => {
  const db = createDb(c.env.DB)
  const auth = createAuth(db, TRUSTED_ORIGINS)
  return getMe(c, auth)
})

export { userRouter }
