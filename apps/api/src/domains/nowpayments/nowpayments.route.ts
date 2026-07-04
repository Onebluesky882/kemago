import { Hono } from 'hono'
import { createInvoiceSchema } from './nowpayments.schema'
import { createInvoice, getPaymentStatus, verifyIpnSignature } from './nowpayments.handler'

type Bindings = {
  NOWPAYMENTS_API_KEY: string
  NOWPAYMENTS_IPN_SECRET: string
}

const nowpaymentsRouter = new Hono<{ Bindings: Bindings }>()

// Create a hosted crypto invoice (NOWPayments-hosted payment page)
nowpaymentsRouter.post('/invoice', async (c) => {
  const body = await c.req.json()
  const parsed = createInvoiceSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid request', issues: parsed.error.issues }, 400)

  try {
    const invoice = await createInvoice(c.env.NOWPAYMENTS_API_KEY, parsed.data)
    return c.json({ invoiceUrl: invoice.invoice_url, id: invoice.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 502)
  }
})

// Check the status of a payment
nowpaymentsRouter.get('/status/:paymentId', async (c) => {
  const paymentId = c.req.param('paymentId')

  try {
    const payment = await getPaymentStatus(c.env.NOWPAYMENTS_API_KEY, paymentId)
    return c.json(payment)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: msg }, 502)
  }
})

// NOWPayments IPN webhook — receives payment status updates
nowpaymentsRouter.post('/webhook', async (c) => {
  const signature = c.req.header('x-nowpayments-sig')
  if (!signature) return c.json({ error: 'Missing signature' }, 400)

  const body = await c.req.json()
  const valid = await verifyIpnSignature(c.env.NOWPAYMENTS_IPN_SECRET, body, signature)
  if (!valid) return c.json({ error: 'Invalid signature' }, 401)

  // TODO: on body.payment_status === 'finished' | 'confirmed', mark the
  // matching order_id as paid in your own DB — mirror how payment.route.ts's
  // Stripe webhook writes to the `purchases` table.

  return c.json({ ok: true })
})

export { nowpaymentsRouter }
