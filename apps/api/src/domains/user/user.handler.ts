import type { Context } from 'hono'
import type { Auth } from '@fullstack-builder/auth'

export async function getMe(c: Context, auth: Auth) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  return c.json({ user: session.user })
}
