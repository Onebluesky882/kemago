import { describe, it, expect, vi, beforeEach } from 'vitest'
import { replyLineMessage, pushLineMessage, getLineProfile } from './client'

const mockFetch = vi.fn((_url: unknown, _opts?: RequestInit) => Promise.resolve(new Response('{}', { status: 200 })))
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => vi.clearAllMocks())

function lastCall() {
  const [url, init] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1] as [
    string,
    { headers: Record<string, string>; body: string },
  ]
  return { url, init }
}

describe('replyLineMessage', () => {
  it('posts to the reply endpoint with the reply token and text', async () => {
    await replyLineMessage('token', 'rt1', 'สวัสดี')
    const { url, init } = lastCall()
    expect(url).toBe('https://api.line.me/v2/bot/message/reply')
    expect(init.headers.Authorization).toBe('Bearer token')
    expect(JSON.parse(init.body)).toEqual({ replyToken: 'rt1', messages: [{ type: 'text', text: 'สวัสดี' }] })
  })

  it('throws on a non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce(new Response('invalid token', { status: 401 }))
    await expect(replyLineMessage('bad-token', 'rt1', 'hi')).rejects.toThrow('LINE reply message failed: 401')
  })
})

describe('pushLineMessage', () => {
  it('posts to the push endpoint with the user id and text', async () => {
    await pushLineMessage('token', 'U1', 'ออเดอร์พร้อมแล้ว')
    const { url, init } = lastCall()
    expect(url).toBe('https://api.line.me/v2/bot/message/push')
    expect(JSON.parse(init.body)).toEqual({ to: 'U1', messages: [{ type: 'text', text: 'ออเดอร์พร้อมแล้ว' }] })
  })

  it('throws on a non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce(new Response('rate limited', { status: 429 }))
    await expect(pushLineMessage('token', 'U1', 'hi')).rejects.toThrow('LINE push message failed: 429')
  })
})

describe('getLineProfile', () => {
  it('fetches and returns the profile', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ userId: 'U1', displayName: 'Ann' }), { status: 200 })
    )
    const profile = await getLineProfile('token', 'U1')
    expect(profile.displayName).toBe('Ann')
    const { url } = lastCall()
    expect(url).toBe('https://api.line.me/v2/bot/profile/U1')
  })

  it('throws on a non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce(new Response('not found', { status: 404 }))
    await expect(getLineProfile('token', 'Ux')).rejects.toThrow('LINE get profile failed: 404')
  })
})
