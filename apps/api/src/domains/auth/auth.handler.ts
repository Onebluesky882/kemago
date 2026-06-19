import type { Auth } from '@fullstack-builder/auth'
import type { Context } from 'hono'

export async function handleAuth(c: Context, auth: Auth) {
  return auth.handler(c.req.raw)
}
