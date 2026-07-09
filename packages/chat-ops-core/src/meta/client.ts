export interface SendMetaMessageOptions {
  /** Graph API version segment, e.g. `"v21.0"`. Defaults to a recent stable
   * version — override if your app is pinned to a specific version. */
  apiVersion?: string
}

/**
 * Send a text message via Meta's Send API. Works for both Facebook
 * Messenger and Instagram Direct — once an Instagram account is linked to a
 * Page, Meta serves both through the same Graph API endpoint, keyed by the
 * Page access token and the recipient's page-scoped id.
 */
export async function sendMetaMessage(
  pageAccessToken: string,
  recipientId: string,
  text: string,
  opts: SendMetaMessageOptions = {}
): Promise<void> {
  const version = opts.apiVersion ?? 'v21.0'
  const res = await fetch(
    `https://graph.facebook.com/${version}/me/messages?access_token=${encodeURIComponent(pageAccessToken)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: { id: recipientId }, message: { text } }),
    }
  )

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Meta Send API failed: ${res.status} ${body.slice(0, 300)}`)
  }
}
