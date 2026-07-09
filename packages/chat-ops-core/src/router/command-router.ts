export type CommandMatcher = string | ((text: string) => boolean)

export interface CommandDefinition<TContext> {
  /** Exact string match, or a predicate for prefix/pattern matching
   * (e.g. `(text) => text.startsWith('/set')`). */
  match: CommandMatcher
  handler: (text: string, ctx: TContext) => Promise<void> | void
}

function matches(matcher: CommandMatcher, text: string): boolean {
  return typeof matcher === 'string' ? text === matcher : matcher(text)
}

/**
 * Dispatch `text` to the first matching command (declaration order), falling
 * back to `fallback` if nothing matches. This is the same if/else-chain every
 * Telegram bot starts with, just given a name and one entry point — adding a
 * command becomes "push one object onto the array" instead of another `if`.
 */
export async function dispatchCommand<TContext>(
  text: string,
  commands: CommandDefinition<TContext>[],
  ctx: TContext,
  fallback: (text: string, ctx: TContext) => Promise<void> | void
): Promise<void> {
  for (const cmd of commands) {
    if (matches(cmd.match, text)) {
      await cmd.handler(text, ctx)
      return
    }
  }
  await fallback(text, ctx)
}

/**
 * Convenience for the common "/cmd rest of text" shape — strips the command
 * word and returns the trimmed remainder (empty string if there is none).
 */
export function commandArgs(text: string, command: string): string {
  return text.slice(command.length).trim()
}
