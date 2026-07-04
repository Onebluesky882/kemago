import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { health } from './domains/health/health.route'
import { authRouter } from './domains/auth/auth.route'
import { userRouter } from './domains/user/user.route'
import { emailRouter } from './domains/email/email.route'
import { storageRouter } from './domains/storage/storage.route'
import { paymentRouter } from './domains/payment/payment.route'
import { forumRouter } from './domains/forum/forum.route'
import { roadmapRouter } from './domains/roadmap/roadmap.route'
import { agentRouter } from './domains/agent/agent.route'
import { setupRouter } from './domains/setup/setup.route'
import { telegramRouter } from './domains/telegram/telegram.route'
import { discordRouter } from './domains/discord/discord.route'
import { nowpaymentsRouter } from './domains/nowpayments/nowpayments.route'

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  OWNER_EMAIL: string
  ALLOWED_ORIGINS: string
  RESEND_API_KEY: string
  R2_ACCOUNT_ID: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_BUCKET_NAME: string
  STRIPE_SECRET_KEY: string
  STRIPE_PUBLISHABLE_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  ANTHROPIC_API_KEY: string
  ANTHROPIC_AGENT_ID: string
  ANTHROPIC_ENV_ID: string
  BOT_TOKEN: string
  TELEGRAM_SECRET_TOKEN: string
  DISCORD_PUBLIC_KEY: string
  DISCORD_BOT_TOKEN: string
  NOWPAYMENTS_API_KEY: string
  NOWPAYMENTS_IPN_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', async (c, next) => {
  const extra = (c.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean)
  return cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', ...extra],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })(c, next)
})

app.route('/health', health)
app.route('/api/auth', authRouter)
app.route('/api/user', userRouter)
app.route('/api/email', emailRouter)
app.route('/api/storage', storageRouter)
app.route('/api/payment', paymentRouter)
app.route('/api/forum', forumRouter)
app.route('/api/roadmap', roadmapRouter)
app.route('/api/agent', agentRouter)
app.route('/api/setup', setupRouter)
app.route('/webhook', telegramRouter)
app.route('/api/discord', discordRouter)
app.route('/api/nowpayments', nowpaymentsRouter)

export default app
