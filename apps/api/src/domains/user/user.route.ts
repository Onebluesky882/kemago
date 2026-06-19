import { Hono } from 'hono'
import { createAuth } from '@fullstack-builder/auth'
import { createDb } from '@fullstack-builder/db'
import { getMe } from './user.handler'

const userRouter = new Hono<{ Bindings: { DB: D1Database } }>()

userRouter.get('/me', async (c) => {
  const db = createDb(c.env.DB)
  const auth = createAuth(db)
  return getMe(c, auth)
})

export { userRouter }
