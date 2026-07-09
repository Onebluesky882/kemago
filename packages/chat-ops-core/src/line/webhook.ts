import { timingSafeEqual } from '../internal/timing-safe-equal'

// Minimal LINE Messaging API webhook shapes — only what chat-ops-core reads.
// Extend locally in your app if you need more (stickers, images, postback, follow/unfollow, etc.).
export interface LineEvent {
  type: string
  replyToken?: string
  source?: { type: string; userId?: string }
  message?: { type: string; text?: string }
}

export interface LineWebhookBody {
  destination: string
  events: LineEvent[]
}

export interface IncomingLineMessage {
  userId: string
  text: string
  /** Single-use, short-lived (~1 minute) — reply with it from inside the
   * webhook handler itself, not from a background job. */
  replyToken: string
}

/**
 * Verify LINE's `x-line-signature` webhook header: HMAC-SHA256 over the exact
 * raw request body, keyed with the channel secret, base64-encoded.
 *
 * Must be called with the *raw* body string. Parsing the body to JSON and
 * re-serializing it (or otherwise reformatting) changes the bytes and breaks
 * verification — read the request body as text once, pass that same string
 * here and to `JSON.parse` / `extractLineMessages`.
 */
export async function verifyLineWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  channelSecret: string
): Promise<boolean> {
  if (!signatureHeader || !channelSecret) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(channelSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  return timingSafeEqual(base64Encode(new Uint8Array(digest)), signatureHeader)
}

function base64Encode(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

/**
 * Pull text-message events out of a webhook body. Unlike Telegram's
 * one-update-per-request shape, a single LINE webhook delivery can batch
 * multiple events (e.g. several users messaging in the same window) — so
 * this returns an array. Non-text events (stickers, images, follow/unfollow,
 * postback, etc.) are filtered out; handle those yourself from `body.events`
 * if you need them.
 */
export function extractLineMessages(body: LineWebhookBody): IncomingLineMessage[] {
  const out: IncomingLineMessage[] = []
  for (const event of body.events ?? []) {
    if (
      event.type === 'message' &&
      event.message?.type === 'text' &&
      typeof event.message.text === 'string' &&
      event.source?.userId &&
      event.replyToken
    ) {
      out.push({
        userId: event.source.userId,
        text: event.message.text.trim(),
        replyToken: event.replyToken,
      })
    }
  }
  return out
}
