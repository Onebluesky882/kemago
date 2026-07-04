import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateKeyPairSync, sign as nodeSign, type KeyObject } from 'node:crypto'
import { discordRouter } from './discord.route'

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex')
}

// Node's Ed25519 JWK export exposes the raw 32-byte public key as base64url in `x`.
function rawPublicKeyHex(publicKey: KeyObject): string {
  const jwk = publicKey.export({ format: 'jwk' }) as { x: string }
  return toHex(Buffer.from(jwk.x, 'base64url'))
}

const { publicKey, privateKey } = generateKeyPairSync('ed25519')
const DISCORD_PUBLIC_KEY = rawPublicKeyHex(publicKey)

const MOCK_ENV = {
  DISCORD_PUBLIC_KEY,
  DISCORD_BOT_TOKEN: 'fake-bot-token',
}

function sign(timestamp: string, rawBody: string): string {
  const message = Buffer.from(timestamp + rawBody)
  return toHex(nodeSign(null, message, privateKey))
}

function makeReq(body: object, opts?: { badSignature?: boolean; omitHeaders?: boolean }): Request {
  const rawBody = JSON.stringify(body)
  const timestamp = String(Math.floor(Date.now() / 1000))
  const signature = opts?.badSignature ? 'deadbeef'.repeat(16) : sign(timestamp, rawBody)

  return new Request('http://localhost/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(opts?.omitHeaders
        ? {}
        : { 'X-Signature-Ed25519': signature, 'X-Signature-Timestamp': timestamp }),
    },
    body: rawBody,
  })
}

let mockFetch: ReturnType<typeof vi.fn>

beforeEach(() => {
  mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
  vi.stubGlobal('fetch', mockFetch)
})

describe('Discord signature guard', () => {
  it('returns 401 when signature headers are missing', async () => {
    const res = await discordRouter.request('/interactions', makeReq({ type: 1 }, { omitHeaders: true }), MOCK_ENV)
    expect(res.status).toBe(401)
  })

  it('returns 401 when the signature is invalid', async () => {
    const res = await discordRouter.request('/interactions', makeReq({ type: 1 }, { badSignature: true }), MOCK_ENV)
    expect(res.status).toBe(401)
  })
})

describe('PING', () => {
  it('responds with PONG (type 1)', async () => {
    const res = await discordRouter.request('/interactions', makeReq({ type: 1 }), MOCK_ENV)
    expect(res.status).toBe(200)
    const body = await res.json() as { type: number }
    expect(body.type).toBe(1)
  })
})

describe('/help command', () => {
  it('returns a channel message with help text', async () => {
    const res = await discordRouter.request(
      '/interactions',
      makeReq({ type: 2, data: { name: 'help' } }),
      MOCK_ENV,
    )
    expect(res.status).toBe(200)
    const body = await res.json() as { type: number; data: { content: string } }
    expect(body.type).toBe(4)
    expect(body.data.content).toContain('/help')
  })
})

describe('unknown command', () => {
  it('replies with an unknown-command message', async () => {
    const res = await discordRouter.request(
      '/interactions',
      makeReq({ type: 2, data: { name: 'nope' } }),
      MOCK_ENV,
    )
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { content: string } }
    expect(body.data.content).toContain('nope')
  })
})

describe('/notify endpoint', () => {
  it('sends a message and returns ok', async () => {
    const res = await discordRouter.request(
      '/notify',
      new Request('http://localhost/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: '123', content: 'test notification' }),
      }),
      MOCK_ENV,
    )
    expect(res.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('returns 400 when channelId is missing', async () => {
    const res = await discordRouter.request(
      '/notify',
      new Request('http://localhost/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'no channelId' }),
      }),
      MOCK_ENV,
    )
    expect(res.status).toBe(400)
  })
})
