import { Hono } from 'hono'
import { notifySchema } from './discord.schema'
import { sendDiscordMessage, verifyDiscordRequest } from './discord.service'

type Bindings = {
  DISCORD_PUBLIC_KEY: string
  DISCORD_BOT_TOKEN: string
}

const discordRouter = new Hono<{ Bindings: Bindings }>()

// Discord Interactions endpoint — set this URL (…/api/discord/interactions) as the
// "Interactions Endpoint URL" in the Discord Developer Portal for your application.
discordRouter.post('/interactions', async (c) => {
  const signature = c.req.header('X-Signature-Ed25519')
  const timestamp = c.req.header('X-Signature-Timestamp')
  const rawBody = await c.req.text()

  if (!signature || !timestamp) return c.json({ error: 'Unauthorized' }, 401)

  const valid = await verifyDiscordRequest(c.env.DISCORD_PUBLIC_KEY, signature, timestamp, rawBody)
  if (!valid) return c.json({ error: 'Invalid request signature' }, 401)

  const interaction = JSON.parse(rawBody)

  // PING — Discord's endpoint verification check
  if (interaction.type === 1) {
    return c.json({ type: 1 })
  }

  // APPLICATION_COMMAND — slash command invocation
  if (interaction.type === 2) {
    const commandName = interaction.data?.name

    if (commandName === 'help') {
      return c.json({ type: 4, data: { content: helpText() } })
    }

    // TODO: add your own slash commands here
    return c.json({ type: 4, data: { content: `Unknown command "${commandName}" — try /help` } })
  }

  return c.json({ error: 'Unsupported interaction type' }, 400)
})

// Send a notification to a specific channel (call from other routes)
discordRouter.post('/notify', async (c) => {
  const body = await c.req.json()
  const parsed = notifySchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'channelId and content required' }, 400)

  const { channelId, content } = parsed.data
  await sendDiscordMessage(c.env.DISCORD_BOT_TOKEN, channelId, content)
  return c.json({ ok: true })
})

function helpText() {
  return ['**Bot Commands**', '/help — show all commands', '', '// TODO: add your commands here'].join('\n')
}

export { discordRouter }
