import { describe, it, expect, vi, beforeEach } from 'vitest'
import { telegramRouter } from './telegram.route'

const VALID_SECRET = 'test-secret-token'
const MOCK_ENV = {
  BOT_TOKEN: 'fake-bot-token',
  TELEGRAM_SECRET_TOKEN: VALID_SECRET,
}

function makeUpdate(text: string) {
  return { message: { chat: { id: 123456 }, text } }
}

function makeReq(body: object, secret?: string): Request {
  return new Request('http://localhost/telegram', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { 'X-Telegram-Bot-Api-Secret-Token': secret } : {}),
    },
    body: JSON.stringify(body),
  })
}

let mockFetch: ReturnType<typeof vi.fn>

beforeEach(() => {
  mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
  vi.stubGlobal('fetch', mockFetch)
})

describe('Telegram auth guard', () => {
  it('returns 401 when secret header is missing', async () => {
    const res = await telegramRouter.request('/telegram', makeReq(makeUpdate('/help')), MOCK_ENV)
    expect(res.status).toBe(401)
  })

  it('returns 401 when secret is wrong', async () => {
    const res = await telegramRouter.request('/telegram', makeReq(makeUpdate('/help'), 'bad-secret'), MOCK_ENV)
    expect(res.status).toBe(401)
  })
})

describe('/help command', () => {
  it('returns 200 and calls sendMessage', async () => {
    const res = await telegramRouter.request('/telegram', makeReq(makeUpdate('/help'), VALID_SECRET), MOCK_ENV)
    expect(res.status).toBe(200)
    const body = await res.json() as { ok: boolean }
    expect(body.ok).toBe(true)
    expect(mockFetch).toHaveBeenCalledOnce()
  })
})

describe('/start command', () => {
  it('returns 200', async () => {
    const res = await telegramRouter.request('/telegram', makeReq(makeUpdate('/start'), VALID_SECRET), MOCK_ENV)
    expect(res.status).toBe(200)
  })
})

describe('unknown command', () => {
  it('echoes back with /help suggestion', async () => {
    const res = await telegramRouter.request('/telegram', makeReq(makeUpdate('hello'), VALID_SECRET), MOCK_ENV)
    expect(res.status).toBe(200)
    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit]
    const sent = JSON.parse(opts.body as string)
    expect(sent.text).toContain('/help')
  })
})

describe('update without chatId', () => {
  it('returns 200 without calling sendMessage', async () => {
    const res = await telegramRouter.request('/telegram', makeReq({ message: {} }, VALID_SECRET), MOCK_ENV)
    expect(res.status).toBe(200)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})

describe('/notify endpoint', () => {
  it('sends message and returns ok', async () => {
    const res = await telegramRouter.request(
      '/notify',
      new Request('http://localhost/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: 123, text: 'test notification' }),
      }),
      MOCK_ENV,
    )
    expect(res.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('returns 400 when chatId missing', async () => {
    const res = await telegramRouter.request(
      '/notify',
      new Request('http://localhost/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'no chatId' }),
      }),
      MOCK_ENV,
    )
    expect(res.status).toBe(400)
  })
})
