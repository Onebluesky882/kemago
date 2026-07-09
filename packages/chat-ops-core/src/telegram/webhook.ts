import { timingSafeEqual } from '../internal/timing-safe-equal'

// Minimal Telegram Bot API update shape — only the fields chat-ops-core reads.
// Extend locally in your app if you need more (photos, callback_query, etc.).
export interface TelegramUpdate {
  message?: {
    chat: { id: number }
    from?: { first_name?: string; id?: number }
    text?: string
  }
}

export interface IncomingMessage {
  chatId: number
  text: string
  firstName?: string
}

/**
 * Verify Telegram's `X-Telegram-Bot-Api-Secret-Token` header against the
 * secret you set via `setWebhook(..., secret_token=...)`.
 */
export function verifyWebhookSecret(receivedHeader: string | null | undefined, expected: string): boolean {
  return !!receivedHeader && !!expected && timingSafeEqual(receivedHeader, expected)
}

/**
 * Pull the parts every command handler needs out of a raw Telegram update.
 * Returns null for updates with no text message (edits, photos, stickers,
 * etc.) — callers should just ack with 200 and do nothing in that case.
 */
export function extractMessage(update: TelegramUpdate): IncomingMessage | null {
  const msg = update.message
  if (!msg?.text || msg.chat?.id == null) return null
  return {
    chatId: msg.chat.id,
    text: msg.text.trim(),
    firstName: msg.from?.first_name,
  }
}
