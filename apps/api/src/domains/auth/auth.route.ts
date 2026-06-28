import { Hono } from 'hono'
import { createAuth } from '@gover-agent/auth'
import { createDb } from '@gover-agent/db'

type Bindings = { DB: D1Database; OWNER_EMAIL: string; ALLOWED_ORIGINS: string }

const authRouter = new Hono<{ Bindings: Bindings }>()

function getAuth(env: Bindings) {
  const db = createDb(env.DB)
  const extra = (env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean)
  return createAuth(db, ['http://localhost:3000', 'http://localhost:3001', ...extra], env.OWNER_EMAIL)
}

authRouter.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  const auth = getAuth(c.env)
  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: c.req.raw.headers,
    })
    return c.json({ user: result.user, token: result.token })
  } catch {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
})

authRouter.post('/register', async (c) => {
  const { name, email, password } = await c.req.json()
  const auth = getAuth(c.env)
  try {
    const result = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: c.req.raw.headers,
    })
    return c.json({ user: result.user, token: result.token })
  } catch {
    return c.json({ error: 'Sign up failed' }, 400)
  }
})

// Catch-all for all other better-auth routes (session, sign-out, etc.)
authRouter.all('/*', async (c) => {
  const auth = getAuth(c.env)
  return auth.handler(c.req.raw)
})

export { authRouter }
