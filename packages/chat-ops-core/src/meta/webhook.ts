import { timingSafeEqual } from '../internal/timing-safe-equal'

// Minimal Meta (Facebook Messenger + Instagram) webhook shapes — only what
// chat-ops-core reads. Both platforms deliver the same entry[].messaging[]
// shape once an Instagram account is linked to a Page, which is why one
// module covers both — extend locally if you need attachments, postbacks,
// delivery/read receipts, or message echoes.
export interface MetaMessagingEvent {
  sender?: { id?: string }
  recipient?: { id?: string }
  message?: { mid?: string; text?: string; is_echo?: boolean }
}

export interface MetaWebhookBody {
  /** `"page"` for Messenger, `"instagram"` for Instagram Direct. */
  object: string
  entry: Array<{ id?: string; time?: number; messaging?: MetaMessagingEvent[] }>
}

export interface IncomingMetaMessage {
  senderId: string
  text: string
}

/**
 * Handle Meta's webhook subscription handshake — the one-time GET request
 * carrying `hub.mode`, `hub.verify_token`, and `hub.challenge` query params
 * when you register the callback URL in the Meta App Dashboard.
 *
 * Returns the challenge string to echo back verbatim as a `200` **plain
 * text** response (not JSON-wrapped), or `null` if verification fails or
 * this isn't a subscribe request — respond `400` in that case.
 */
export function verifyWebhookChallenge(
  query: {
    'hub.mode'?: string | null
    'hub.verify_token'?: string | null
    'hub.challenge'?: string | null
  },
  verifyToken: string
): string | null {
  if (query['hub.mode'] !== 'subscribe') return null
  if (!query['hub.verify_token'] || !verifyToken) return null
  if (!timingSafeEqual(query['hub.verify_token'], verifyToken)) return null
  return query['hub.challenge'] ?? null
}

/**
 * Verify Meta's `x-hub-signature-256` webhook header: HMAC-SHA256 over the
 * exact raw request body, keyed with the app secret, hex-encoded and
 * prefixed `sha256=`.
 *
 * Must be called with the *raw* body string — parsing then re-serializing
 * changes the bytes and breaks verification. Read the body as text once,
 * pass that same string here and to `JSON.parse` / `extractMetaMessages`.
 */
export async function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  appSecret: string
): Promise<boolean> {
  const prefix = 'sha256='
  if (!signatureHeader || !appSecret || !signatureHeader.startsWith(prefix)) return false
  const received = signatureHeader.slice(prefix.length)

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  return timingSafeEqual(hexEncode(new Uint8Array(digest)), received)
}

function hexEncode(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Pull text-message events out of a webhook body. A delivery can batch
 * multiple entries/events, so this returns an array. Filters out non-text
 * events (attachments, postbacks, delivery/read receipts) and **echoes**
 * (messages your own page sent, which Meta also delivers back to your
 * webhook if you've enabled echo delivery) — without the echo filter, a bot
 * would see its own replies as if a user had sent them.
 */
export function extractMetaMessages(body: MetaWebhookBody): IncomingMetaMessage[] {
  const out: IncomingMetaMessage[] = []
  for (const entry of body.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      if (event.message?.is_echo) continue
      if (event.sender?.id && typeof event.message?.text === 'string') {
        out.push({ senderId: event.sender.id, text: event.message.text.trim() })
      }
    }
  }
  return out
}
