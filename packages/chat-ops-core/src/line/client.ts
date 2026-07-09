const LINE_API_BASE = 'https://api.line.me/v2/bot'

/**
 * Reply to a specific webhook event using its `replyToken`. Reply messages
 * don't count against the free-tier monthly message quota — prefer this over
 * `pushLineMessage` whenever you're responding to something the user just
 * sent. Reply tokens expire quickly, so call this from inside the webhook
 * handler, not from a background job.
 */
export async function replyLineMessage(channelAccessToken: string, replyToken: string, text: string): Promise<void> {
  const res = await fetch(`${LINE_API_BASE}/message/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`LINE reply message failed: ${res.status} ${body.slice(0, 300)}`)
  }
}

/**
 * Push a message to a user outside the reply-token window — e.g. a kitchen
 * status update sent later, not in direct response to something the user
 * just typed. Push messages count against LINE's free-tier monthly quota;
 * reply messages do not.
 */
export async function pushLineMessage(channelAccessToken: string, userId: string, text: string): Promise<void> {
  const res = await fetch(`${LINE_API_BASE}/message/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({ to: userId, messages: [{ type: 'text', text }] }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`LINE push message failed: ${res.status} ${body.slice(0, 300)}`)
  }
}

export interface LineProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

/**
 * Fetch a user's LINE profile. Webhook events only carry `userId` — call
 * this once (e.g. during onboarding, in your `ChatLinkStore.create`) if you
 * want a display name to show back to the user or store for staff.
 */
export async function getLineProfile(channelAccessToken: string, userId: string): Promise<LineProfile> {
  const res = await fetch(`${LINE_API_BASE}/profile/${userId}`, {
    headers: { Authorization: `Bearer ${channelAccessToken}` },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`LINE get profile failed: ${res.status} ${body.slice(0, 300)}`)
  }

  return res.json() as Promise<LineProfile>
}
