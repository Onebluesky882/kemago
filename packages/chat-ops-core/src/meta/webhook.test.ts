import { describe, it, expect } from 'vitest'
import { verifyWebhookChallenge, verifyMetaWebhookSignature, extractMetaMessages } from './webhook'

describe('verifyWebhookChallenge', () => {
  const verifyToken = 'my-verify-token'

  it('returns the challenge when mode and token match', () => {
    const result = verifyWebhookChallenge(
      { 'hub.mode': 'subscribe', 'hub.verify_token': verifyToken, 'hub.challenge': 'chal-123' },
      verifyToken
    )
    expect(result).toBe('chal-123')
  })

  it('returns null when the mode is not "subscribe"', () => {
    const result = verifyWebhookChallenge(
      { 'hub.mode': 'unsubscribe', 'hub.verify_token': verifyToken, 'hub.challenge': 'chal-123' },
      verifyToken
    )
    expect(result).toBeNull()
  })

  it('returns null when the verify token does not match', () => {
    const result = verifyWebhookChallenge(
      { 'hub.mode': 'subscribe', 'hub.verify_token': 'wrong', 'hub.challenge': 'chal-123' },
      verifyToken
    )
    expect(result).toBeNull()
  })

  it('returns null when the verify token is missing', () => {
    const result = verifyWebhookChallenge({ 'hub.mode': 'subscribe', 'hub.challenge': 'chal-123' }, verifyToken)
    expect(result).toBeNull()
  })
})

// Reference signature computation, independent of verifyMetaWebhookSignature's
// own internals, so this exercises the export rather than re-deriving its
// own expectation.
async function sign(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `sha256=${hex}`
}

describe('verifyMetaWebhookSignature', () => {
  const secret = 'test-app-secret'
  const body = JSON.stringify({ object: 'page', entry: [] })

  it('accepts a correctly signed body', async () => {
    await expect(verifyMetaWebhookSignature(body, await sign(secret, body), secret)).resolves.toBe(true)
  })

  it('rejects a signature computed with the wrong secret', async () => {
    await expect(verifyMetaWebhookSignature(body, await sign('wrong-secret', body), secret)).resolves.toBe(false)
  })

  it('rejects when the body has been tampered with after signing', async () => {
    const sig = await sign(secret, body)
    await expect(verifyMetaWebhookSignature(body + 'tampered', sig, secret)).resolves.toBe(false)
  })

  it('rejects a signature missing the "sha256=" prefix', async () => {
    const sig = await sign(secret, body)
    await expect(verifyMetaWebhookSignature(body, sig.replace('sha256=', ''), secret)).resolves.toBe(false)
  })

  it('rejects a missing signature header', async () => {
    await expect(verifyMetaWebhookSignature(body, null, secret)).resolves.toBe(false)
    await expect(verifyMetaWebhookSignature(body, undefined, secret)).resolves.toBe(false)
  })

  it('rejects when the app secret is empty', async () => {
    await expect(verifyMetaWebhookSignature(body, 'sha256=anything', '')).resolves.toBe(false)
  })
})

describe('extractMetaMessages', () => {
  it('extracts text-message events and trims their text', () => {
    const messages = extractMetaMessages({
      object: 'page',
      entry: [
        {
          id: 'page-1',
          messaging: [
            { sender: { id: 'U1' }, recipient: { id: 'page-1' }, message: { mid: 'm1', text: '  ขอส้มตำ 2 ที่  ' } },
          ],
        },
      ],
    })
    expect(messages).toEqual([{ senderId: 'U1', text: 'ขอส้มตำ 2 ที่' }])
  })

  it('filters out echoes of the page\'s own messages', () => {
    const messages = extractMetaMessages({
      object: 'page',
      entry: [
        {
          messaging: [{ sender: { id: 'page-1' }, message: { mid: 'm1', text: 'รับออเดอร์แล้ว', is_echo: true } }],
        },
      ],
    })
    expect(messages).toEqual([])
  })

  it('filters out non-text events (attachments, postbacks)', () => {
    const messages = extractMetaMessages({
      object: 'page',
      entry: [
        {
          messaging: [
            { sender: { id: 'U1' }, message: { mid: 'm1' } }, // attachment, no text
            { sender: { id: 'U2' } }, // postback-only, no message at all
          ],
        },
      ],
    })
    expect(messages).toEqual([])
  })

  it('returns an empty array when there are no entries', () => {
    expect(extractMetaMessages({ object: 'page', entry: [] })).toEqual([])
  })
})
