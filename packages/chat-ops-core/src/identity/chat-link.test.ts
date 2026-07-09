import { describe, it, expect, vi } from 'vitest'
import { resolveOrCreateIdentity, type ChatLinkStore } from './chat-link'

describe('resolveOrCreateIdentity', () => {
  it('returns the existing identity without creating one', async () => {
    const store: ChatLinkStore = {
      find: vi.fn().mockResolvedValue('user-1'),
      create: vi.fn(),
    }

    const id = await resolveOrCreateIdentity(store, 42)

    expect(id).toBe('user-1')
    expect(store.create).not.toHaveBeenCalled()
  })

  it('creates and returns a new identity on first contact', async () => {
    const store: ChatLinkStore = {
      find: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue('user-new'),
    }

    const id = await resolveOrCreateIdentity(store, 42, { firstName: 'Ann' })

    expect(id).toBe('user-new')
    expect(store.create).toHaveBeenCalledWith(42, { firstName: 'Ann' })
  })
})
