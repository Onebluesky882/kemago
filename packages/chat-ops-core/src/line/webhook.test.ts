import { describe, it, expect } from 'vitest'
import { verifyLineWebhookSignature, extractLineMessages } from './webhook'

// Reference signature computation, independent of verifyLineWebhookSignature's
// own internals (separate crypto.subtle call, separate base64 encoding loop)
// so this exercises the export rather than re-deriving its own expectation.
async function sign(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  let binary = ''
  for (const b of new Uint8Array(digest)) binary += String.fromCharCode(b)
  return btoa(binary)
}

describe('verifyLineWebhookSignature', () => {
  const secret = 'test-channel-secret'
  const body = JSON.stringify({ destination: 'xxx', events: [] })

  it('accepts a correctly signed body', async () => {
    await expect(verifyLineWebhookSignature(body, await sign(secret, body), secret)).resolves.toBe(true)
  })

  it('rejects a signature computed with the wrong secret', async () => {
    await expect(verifyLineWebhookSignature(body, await sign('wrong-secret', body), secret)).resolves.toBe(false)
  })

  it('rejects when the body has been tampered with after signing', async () => {
    const sig = await sign(secret, body)
    await expect(verifyLineWebhookSignature(body + 'tampered', sig, secret)).resolves.toBe(false)
  })

  it('rejects a missing signature header', async () => {
    await expect(verifyLineWebhookSignature(body, null, secret)).resolves.toBe(false)
    await expect(verifyLineWebhookSignature(body, undefined, secret)).resolves.toBe(false)
  })

  it('rejects when the channel secret is empty', async () => {
    // Short-circuits before ever computing a signature (an empty HMAC key is
    // invalid anyway), so any non-empty header string works here.
    await expect(verifyLineWebhookSignature(body, 'anything', '')).resolves.toBe(false)
  })
})

describe('extractLineMessages', () => {
  it('extracts text-message events and trims their text', () => {
    const messages = extractLineMessages({
      destination: 'xxx',
      events: [
        {
          type: 'message',
          replyToken: 'rt1',
          source: { type: 'user', userId: 'U1' },
          message: { type: 'text', text: '  ขอส้มตำ 2 ที่  ' },
        },
        { type: 'follow', source: { type: 'user', userId: 'U2' } },
        {
          type: 'message',
          replyToken: 'rt3',
          source: { type: 'user', userId: 'U3' },
          message: { type: 'sticker' },
        },
      ],
    })

    expect(messages).toEqual([{ userId: 'U1', text: 'ขอส้มตำ 2 ที่', replyToken: 'rt1' }])
  })

  it('returns an empty array when there are no events', () => {
    expect(extractLineMessages({ destination: 'xxx', events: [] })).toEqual([])
  })
})
