export interface SendMessageOptions {
  parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML'
}

/**
 * Send a text message via the Telegram Bot API. Throws on a non-2xx response
 * (e.g. malformed Markdown, invalid chat id) instead of swallowing it — catch
 * at the call site if a failed notification shouldn't fail the whole request.
 */
export async function sendTelegramMessage(
  token: string,
  chatId: number,
  text: string,
  opts: SendMessageOptions = {}
): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: opts.parseMode ?? 'Markdown' }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Telegram sendMessage failed: ${res.status} ${body.slice(0, 300)}`)
  }
}

/**
 * Escape Telegram's legacy Markdown special characters. Use on any user- or
 * model-generated text interpolated into a Markdown message so it can't break
 * formatting (or, under MarkdownV2, fail to send at all).
 */
export function escapeMarkdown(s: string): string {
  return s.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1')
}
