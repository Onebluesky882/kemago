import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseTextToJSON } from './groq-parse'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => vi.clearAllMocks())

function groqResponse(content: string, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status })
  )
}

describe('parseTextToJSON', () => {
  it('extracts and parses the JSON object from the model reply', async () => {
    mockFetch.mockReturnValueOnce(
      groqResponse('Sure, here you go:\n```json\n{"foo": "bar"}\n```')
    )

    const result = await parseTextToJSON({
      apiKey: 'key',
      systemPrompt: 'system',
      userText: 'user text',
    })

    expect(result).toEqual({ foo: 'bar' })
  })

  it('sends the system prompt, user text, and a default model', async () => {
    mockFetch.mockReturnValueOnce(groqResponse('{}'))

    await parseTextToJSON({ apiKey: 'key', systemPrompt: 'sys', userText: 'text' })

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('https://api.groq.com/openai/v1/chat/completions')
    const body = JSON.parse(init.body as string)
    expect(body.model).toBe('llama-3.1-8b-instant')
    expect(body.messages).toEqual([
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'text' },
    ])
  })

  it('throws when the response is not ok', async () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve(new Response('rate limited', { status: 429 }))
    )

    await expect(
      parseTextToJSON({ apiKey: 'key', systemPrompt: 'sys', userText: 'text' })
    ).rejects.toThrow('Groq API error: 429')
  })

  it('throws when the reply has no JSON object', async () => {
    mockFetch.mockReturnValueOnce(groqResponse('no json here'))

    await expect(
      parseTextToJSON({ apiKey: 'key', systemPrompt: 'sys', userText: 'text' })
    ).rejects.toThrow('Groq returned no JSON')
  })
})
