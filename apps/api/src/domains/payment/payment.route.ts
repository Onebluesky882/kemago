import { Hono } from 'hono'
import { createPaymentIntentSchema, createCheckoutSessionSchema } from './payment.schema'
import { createPaymentIntent, createCheckoutSession, handleWebhook } from './payment.handler'

type Bindings = {
  DB: D1Database
  RESEND_API_KEY: string
  R2_ACCOUNT_ID: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_BUCKET_NAME: string
  STRIPE_SECRET_KEY: string
  STRIPE_PUBLISHABLE_KEY: string
  STRIPE_WEBHOOK_SECRET: string
}

const paymentRouter = new Hono<{ Bindings: Bindings }>()

// Get publishable key (safe to expose to frontend)
paymentRouter.get('/config', (c) => {
  return c.json({ publishableKey: c.env.STRIPE_PUBLISHABLE_KEY })
})

// Create a payment intent (for custom checkout UI)
paymentRouter.post('/intent', async (c) => {
  const body = await c.req.json()
  const parsed = createPaymentIntentSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid request' }, 400)
  const { amount, currency, description } = parsed.data
  const intent = await createPaymentIntent(c.env.STRIPE_SECRET_KEY, amount, currency, description)
  return c.json({ clientSecret: intent.client_secret })
})

// Create a hosted checkout session (Stripe-hosted payment page)
paymentRouter.post('/checkout', async (c) => {
  const body = await c.req.json()
  const parsed = createCheckoutSessionSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid request' }, 400)
  const { priceId, successUrl, cancelUrl, customerEmail } = parsed.data
  const session = await createCheckoutSession(
    c.env.STRIPE_SECRET_KEY,
    priceId,
    successUrl,
    cancelUrl,
    customerEmail,
  )
  return c.json({ url: session.url })
})

// Stripe webhook — receives payment events
paymentRouter.post('/webhook', async (c) => {
  const signature = c.req.header('stripe-signature')
  if (!signature) return c.json({ error: 'Missing signature' }, 400)
  const body = await c.req.text()
  try {
    const event = await handleWebhook(
      c.env.STRIPE_SECRET_KEY,
      c.env.STRIPE_WEBHOOK_SECRET,
      body,
      signature,
    )
    switch (event.type) {
      case 'payment_intent.succeeded':
        // TODO: fulfill order, update DB
        break
      case 'checkout.session.completed':
        // TODO: activate subscription or deliver product
        break
    }
    return c.json({ received: true })
  } catch {
    return c.json({ error: 'Webhook verification failed' }, 400)
  }
})

export { paymentRouter }
