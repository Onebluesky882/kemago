// Utility — call sendDiscordMessage from anywhere in the app
// Usage: await sendDiscordMessage(env.DISCORD_BOT_TOKEN, channelId, 'Hello!')

export async function sendDiscordMessage(botToken: string, channelId: string, content: string) {
  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${botToken}`,
    },
    body: JSON.stringify({ content }),
  })
  return res.json()
}

// Verify an incoming Discord Interactions webhook request using Ed25519.
// Discord signs `timestamp + rawBody` with the app's private key; the public
// key (from the Discord Developer Portal) verifies it here.
export async function verifyDiscordRequest(
  publicKeyHex: string,
  signatureHex: string,
  timestamp: string,
  rawBody: string,
): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey('raw', hexToBytes(publicKeyHex), { name: 'Ed25519' }, false, ['verify'])
    const message = new TextEncoder().encode(timestamp + rawBody)
    return await crypto.subtle.verify('Ed25519', key, hexToBytes(signatureHex), message)
  } catch {
    return false
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}
