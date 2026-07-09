/** A chat identifier — numeric for Telegram (`chat.id`), a string for LINE (`userId`). */
export type ChatId = string | number

/**
 * Storage adapter for chat -> identity links. Implement this against whatever
 * DB the consuming app uses (D1, Postgres, KV, ...) — chat-ops-core has no
 * opinion on schema beyond "a chat id maps to some identity id". The identity
 * can be a user, a customer, a restaurant table, whatever the app's domain
 * calls it — `TIdentity` defaults to a plain string id.
 */
export interface ChatLinkStore<TIdentity = string> {
  find(chatId: ChatId): Promise<TIdentity | null>
  create(chatId: ChatId, meta: { firstName?: string }): Promise<TIdentity>
}

/**
 * Resolve the identity linked to a chat, creating one on first contact. This
 * is the "a client adds the bot and is onboarded automatically" pattern — no
 * `/link` command, no manual pairing step required before the bot is useful.
 */
export async function resolveOrCreateIdentity<TIdentity = string>(
  store: ChatLinkStore<TIdentity>,
  chatId: ChatId,
  meta: { firstName?: string } = {}
): Promise<TIdentity> {
  const existing = await store.find(chatId)
  if (existing !== null) return existing
  return store.create(chatId, meta)
}
