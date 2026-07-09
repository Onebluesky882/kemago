import { describe, it, expect, vi } from 'vitest'
import { dispatchCommand, commandArgs, type CommandDefinition } from './command-router'

describe('dispatchCommand', () => {
  it('calls the handler for an exact string match', async () => {
    const help = vi.fn()
    const fallback = vi.fn()
    const commands: CommandDefinition<null>[] = [{ match: '/help', handler: help }]

    await dispatchCommand('/help', commands, null, fallback)

    expect(help).toHaveBeenCalledWith('/help', null)
    expect(fallback).not.toHaveBeenCalled()
  })

  it('calls the handler for a predicate match', async () => {
    const set = vi.fn()
    const commands: CommandDefinition<null>[] = [
      { match: (t) => t.startsWith('/set'), handler: set },
    ]

    await dispatchCommand('/set lotSize 0.05', commands, null, vi.fn())

    expect(set).toHaveBeenCalledWith('/set lotSize 0.05', null)
  })

  it('uses the first matching command when several would match', async () => {
    const first = vi.fn()
    const second = vi.fn()
    const commands: CommandDefinition<null>[] = [
      { match: (t) => t.startsWith('/s'), handler: first },
      { match: (t) => t.startsWith('/set'), handler: second },
    ]

    await dispatchCommand('/set x y', commands, null, vi.fn())

    expect(first).toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()
  })

  it('falls back when nothing matches', async () => {
    const fallback = vi.fn()

    await dispatchCommand('/unknown', [], null, fallback)

    expect(fallback).toHaveBeenCalledWith('/unknown', null)
  })
})

describe('commandArgs', () => {
  it('strips the command word and trims the remainder', () => {
    expect(commandArgs('/set lotSize 0.05', '/set')).toBe('lotSize 0.05')
  })

  it('returns an empty string when there are no args', () => {
    expect(commandArgs('/set', '/set')).toBe('')
    expect(commandArgs('/set   ', '/set')).toBe('')
  })
})
