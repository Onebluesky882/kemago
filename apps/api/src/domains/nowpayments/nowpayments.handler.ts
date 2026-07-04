const API_BASE = 'https://api.nowpayments.io/v1'

type CreateInvoiceParams = {
  priceAmount: number
  priceCurrency: string
  payCurrency?: string
  orderId?: string
  orderDescription?: string
  ipnCallbackUrl: string
  successUrl: string
  cancelUrl: string
}

export async function createInvoice(apiKey: string, params: CreateInvoiceParams) {
  const res = await fetch(`${API_BASE}/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({
      price_amount: params.priceAmount,
      price_currency: params.priceCurrency,
      pay_currency: params.payCurrency,
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: params.ipnCallbackUrl,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`NOWPayments invoice creation failed (${res.status}): ${detail}`)
  }

  return res.json<{ id: string; invoice_url: string; order_id: string | null }>()
}

export async function getPaymentStatus(apiKey: string, paymentId: string) {
  const res = await fetch(`${API_BASE}/payment/${paymentId}`, {
    headers: { 'x-api-key': apiKey },
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`NOWPayments status lookup failed (${res.status}): ${detail}`)
  }

  return res.json<{ payment_id: string; payment_status: string; order_id: string | null }>()
}

// NOWPayments signs IPN callbacks with HMAC-SHA512 over the body's keys sorted
// alphabetically (recursively) and re-stringified — see their IPN docs.
export async function verifyIpnSignature(ipnSecret: string, body: unknown, signatureHex: string): Promise<boolean> {
  const sorted = JSON.stringify(sortKeysDeep(body))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ipnSecret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  )
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(sorted))
  const computedHex = toHex(new Uint8Array(digest))
  return computedHex === signatureHex
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

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
