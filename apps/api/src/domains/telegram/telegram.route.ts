import { Hono } from 'hono'

type Bindings = {
  BOT_TOKEN: string
  TELEGRAM_SECRET_TOKEN: string
}

const telegramRouter = new Hono<{ Bindings: Bindings }>()

// Receive updates from Telegram (webhook)
telegramRouter.post('/telegram', async (c) => {
  const incoming = c.req.header('X-Telegram-Bot-Api-Secret-Token')
  if (!incoming || incoming !== c.env.TELEGRAM_SECRET_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const update = await c.req.json()
  const message = update?.message
  const chatId = message?.chat?.id
  const text = (message?.text ?? '').trim()

  if (!chatId) return c.json({ ok: true })

  if (text === '/start' || text === '/help') {
    await sendMessage(c.env.BOT_TOKEN, chatId, helpText())
    return c.json({ ok: true })
  }

  // TODO: add your own commands here
  await sendMessage(c.env.BOT_TOKEN, chatId, `ไม่รู้จักคำสั่ง "${text}" — ลอง /help`)
  return c.json({ ok: true })
})

// Send a notification to a specific chat (call from other routes)
telegramRouter.post('/notify', async (c) => {
  const { chatId, text } = await c.req.json<{ chatId: number; text: string }>()
  if (!chatId || !text) return c.json({ error: 'chatId and text required' }, 400)

  await sendMessage(c.env.BOT_TOKEN, chatId, text)
  return c.json({ ok: true })
})

// ── helpers ───────────────────────────────────────────────

async function sendMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

function helpText() {
  return [
    '<b>Bot Commands</b>',
    '/help — แสดงคำสั่งทั้งหมด',
    '',
    '// TODO: เพิ่มคำสั่งของคุณที่นี่',
  ].join('\n')
}

export { telegramRouter, sendMessage }
