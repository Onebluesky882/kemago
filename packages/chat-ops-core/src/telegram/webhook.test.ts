import { describe, it, expect } from 'vitest'
import { verifyWebhookSecret, extractMessage } from './webhook'

describe('verifyWebhookSecret', () => {
  it('accepts a matching header', () => {
    expect(verifyWebhookSecret('abc', 'abc')).toBe(true)
  })

  it('rejects a missing header', () => {
    expect(verifyWebhookSecret(null, 'abc')).toBe(false)
    expect(verifyWebhookSecret(undefined, 'abc')).toBe(false)
  })

  it('rejects a mismatched header', () => {
    expect(verifyWebhookSecret('wrong', 'abc')).toBe(false)
  })

  it('rejects when the expected secret is empty', () => {
    expect(verifyWebhookSecret('', '')).toBe(false)
  })
})

describe('extractMessage', () => {
  it('extracts chat id, trimmed text, and first name', () => {
    const result = extractMessage({
      message: { chat: { id: 123 }, from: { first_name: 'Ann' }, text: '  /help  ' },
    })
    expect(result).toEqual({ chatId: 123, text: '/help', firstName: 'Ann' })
  })

  it('returns null when there is no text', () => {
    expect(extractMessage({ message: { chat: { id: 123 } } })).toBeNull()
  })

  it('returns null when there is no message at all', () => {
    expect(extractMessage({})).toBeNull()
  })
})
