import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHmac } from 'node:crypto'
import { nowpaymentsRouter } from './nowpayments.route'

const IPN_SECRET = 'test-ipn-secret'
const MOCK_ENV = {
  NOWPAYMENTS_API_KEY: 'test-api-key',
  NOWPAYMENTS_IPN_SECRET: IPN_SECRET,
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep)
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }
  return value
}

function signIpn(body: object): string {
  const sorted = JSON.stringify(sortKeysDeep(body))
  return createHmac('sha512', IPN_SECRET).update(sorted).digest('hex')
}

let mockFetch: ReturnType<typeof vi.fn>

beforeEach(() => {
  mockFetch = vi.fn()
  vi.stubGlobal('fetch', mockFetch)
})

describe('POST /invoice', () => {
  it('creates an invoice and returns its url', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 'inv_1', invoice_url: 'https://nowpayments.io/pay/inv_1', order_id: 'order_1' }), {
        status: 200,
      }),
    )

    const res = await nowpaymentsRouter.request(
      '/invoice',
      new Request('http://localhost/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceAmount: 10,
          priceCurrency: 'usd',
          ipnCallbackUrl: 'https://example.com/api/nowpayments/webhook',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        }),
      }),
      MOCK_ENV,
    )

    expect(res.status).toBe(200)
    const data = await res.json() as { invoiceUrl: string; id: string }
    expect(data.invoiceUrl).toContain('nowpayments.io')
  })

  it('returns 400 on invalid body', async () => {
    const res = await nowpaymentsRouter.request(
      '/invoice',
      new Request('http://localhost/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceAmount: -5 }),
      }),
      MOCK_ENV,
    )
    expect(res.status).toBe(400)
  })
})

describe('GET /status/:paymentId', () => {
  it('returns the payment status', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ payment_id: 'pay_1', payment_status: 'finished', order_id: 'order_1' }), {
        status: 200,
      }),
    )

    const res = await nowpaymentsRouter.request('/status/pay_1', undefined, MOCK_ENV)
    expect(res.status).toBe(200)
    const data = await res.json() as { payment_status: string }
    expect(data.payment_status).toBe('finished')
  })
})

describe('POST /webhook', () => {
  it('returns 401 when the signature is invalid', async () => {
    const body = { payment_id: 'pay_1', payment_status: 'finished' }
    const res = await nowpaymentsRouter.request(
      '/webhook',
      new Request('http://localhost/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-nowpayments-sig': 'deadbeef' },
        body: JSON.stringify(body),
      }),
      MOCK_ENV,
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 when the signature header is missing', async () => {
    const res = await nowpaymentsRouter.request(
      '/webhook',
      new Request('http://localhost/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: 'pay_1' }),
      }),
      MOCK_ENV,
    )
    expect(res.status).toBe(400)
  })

  it('accepts a validly signed payload', async () => {
    const body = { payment_id: 'pay_1', payment_status: 'finished', order_id: 'order_1' }
    const signature = signIpn(body)

    const res = await nowpaymentsRouter.request(
      '/webhook',
      new Request('http://localhost/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-nowpayments-sig': signature },
        body: JSON.stringify(body),
      }),
      MOCK_ENV,
    )
    expect(res.status).toBe(200)
    const data = await res.json() as { ok: boolean }
    expect(data.ok).toBe(true)
  })
})
