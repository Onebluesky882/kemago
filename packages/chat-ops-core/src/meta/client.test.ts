import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendMetaMessage } from './client'

const mockFetch = vi.fn((_url: unknown, _opts?: RequestInit) => Promise.resolve(new Response('{}', { status: 200 })))
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => vi.clearAllMocks())

function lastCall() {
  const [url, init] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1] as [string, { body: string }]
  return { url, init }
}

describe('sendMetaMessage', () => {
  it('posts to the Send API with the recipient id and text, defaulting the API version', async () => {
    await sendMetaMessage('page-token', 'U1', 'รับออเดอร์แล้ว')
    const { url, init } = lastCall()
    expect(url).toBe('https://graph.facebook.com/v21.0/me/messages?access_token=page-token')
    expect(JSON.parse(init.body)).toEqual({ recipient: { id: 'U1' }, message: { text: 'รับออเดอร์แล้ว' } })
  })

  it('uses a custom API version when given one', async () => {
    await sendMetaMessage('page-token', 'U1', 'hi', { apiVersion: 'v22.0' })
    const { url } = lastCall()
    expect(url).toBe('https://graph.facebook.com/v22.0/me/messages?access_token=page-token')
  })

  it('URL-encodes the access token', async () => {
    await sendMetaMessage('token with spaces', 'U1', 'hi')
    const { url } = lastCall()
    expect(url).toContain('access_token=token%20with%20spaces')
  })

  it('throws on a non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce(new Response('invalid token', { status: 401 }))
    await expect(sendMetaMessage('bad-token', 'U1', 'hi')).rejects.toThrow('Meta Send API failed: 401')
  })
})
