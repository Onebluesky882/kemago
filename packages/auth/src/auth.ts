import { betterAuth } from 'better-auth'
import { bearer } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import type { Db } from '@gover-agent/db'
import * as schema from '@gover-agent/db/schema'

export function createAuth(db: Db, trustedOrigins?: string[]) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    plugins: [bearer()],
    emailAndPassword: { enabled: true },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 60 * 5 },
    },
    trustedOrigins: trustedOrigins ?? [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    advanced: {
      crossSubdomainCookies: {
        enabled: true,
        domain: '.onebluesky882.workers.dev',
      },
      defaultCookieAttributes: {
        sameSite: 'none',
        secure: true,
      },
    },
  })
}

export type Auth = ReturnType<typeof createAuth>
