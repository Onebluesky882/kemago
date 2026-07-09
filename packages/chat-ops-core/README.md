# @gover-agent/chat-ops-core

Reusable building blocks for chat-driven bots (Telegram, LINE, and Facebook
Messenger/Instagram today), extracted from `apps/api`'s Telegram bot
(stage-18). This package has no opinion about your domain — it does not know
about trades, strategies, or restaurant orders. It only handles the parts
every chat bot needs regardless of what it's for, and regardless of which
chat platform it's on:

- **`telegram/webhook`** — verify the webhook secret header, parse a raw
  Telegram update into `{ chatId, text, firstName }`.
- **`telegram/client`** — send a Telegram message, escape Markdown.
- **`line/webhook`** — verify the `x-line-signature` HMAC header
  (`verifyLineWebhookSignature`), parse a raw LINE webhook body into
  `{ userId, text, replyToken }[]` (`extractLineMessages` — a delivery can
  batch several events, unlike Telegram's one-update-per-request shape).
- **`line/client`** — reply to a message (`replyLineMessage`, free, uses the
  short-lived `replyToken`), push a message outside the reply window
  (`pushLineMessage`, counts against the free-tier quota), and fetch a user's
  display name (`getLineProfile` — LINE webhook events carry only `userId`).
- **`meta/webhook`** — handle the one-time subscription handshake
  (`verifyWebhookChallenge`), verify the `x-hub-signature-256` HMAC header
  (`verifyMetaWebhookSignature`), parse a webhook body into
  `{ senderId, text }[]` (`extractMetaMessages` — covers both Facebook
  Messenger and Instagram Direct, which share the same wire shape once the IG
  account is linked to a Page).
- **`meta/client`** — send a text message via the Send API (`sendMetaMessage`).
- **`identity/chat-link`** — resolve (or auto-create) the identity a chat
  belongs to, via a `ChatLinkStore` you implement against your own DB. The
  "identity" can be a user, a customer, a restaurant table — whatever your
  domain calls it. Same abstraction across all platforms.
- **`router/command-router`** — dispatch incoming text to the first matching
  command handler, with a fallback for unrecognized input. Same abstraction
  across all platforms.
- **`nlp/groq-parse`** — send free text + a system prompt to Groq and get back
  parsed JSON, for turning "H1 demand zone, TP 300 SL 150" or "ขอส้มตำ 2 ที่
  ไม่เผ็ด" into structured data.

Only `telegram/*`, `line/*`, and `meta/*` are platform-specific — everything
else (`identity`, `router`, `nlp`) is shared, which is the point: switch or
add a chat platform without rewriting your command/order/onboarding logic.
Webhook secret/signature checks across all three platforms use a shared
constant-time string comparison (`src/internal/timing-safe-equal.ts`, not
exported — an implementation detail) instead of `===`, so verifying a
webhook can't leak timing information about the expected secret.

## Requirements

Runtime only — Web Crypto (`crypto.subtle`, `crypto.randomUUID`) and `btoa`.
Works on Cloudflare Workers, Node 18+, Bun, and browsers. No Node-specific
APIs (`node:crypto`, `Buffer`, etc.) anywhere in `src/` — that's deliberate,
so the "copy the folder into another project" story in the section below
actually holds regardless of what that project runs on.

## Error handling

Every network call (`sendTelegramMessage`, `replyLineMessage`,
`pushLineMessage`, `getLineProfile`, `parseTextToJSON`) **throws** on a
non-2xx response or a malformed reply — none of them swallow failures.
Wrap call sites in `try`/`catch` where a failed notification or a bad LLM
parse shouldn't take down the whole request (see the `/newstrategy`-style
`try`/`catch` pattern in `apps/api/src/routes/telegram.ts` for a worked
example). Nothing in this package retries automatically — add that at the
call site if you need it.

## Environment variables you'll need (per platform)

Not read by this package directly — you pass each of these in explicitly to
the relevant function/env binding. Listed here so you know what to
provision before wiring a handler.

| Platform | Variable | Where it comes from |
|---|---|---|
| Telegram | `BOT_TOKEN` | [@BotFather](https://t.me/BotFather) |
| Telegram | `TELEGRAM_SECRET_TOKEN` | Value you choose yourself, set via `setWebhook(..., secret_token=...)` |
| LINE | `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers Console → your channel → Messaging API tab → "Channel access token" |
| LINE | `LINE_CHANNEL_SECRET` | LINE Developers Console → your channel → Basic settings tab |
| Meta (Messenger/Instagram) | `PAGE_ACCESS_TOKEN` | Meta App Dashboard → your app → Messenger/Instagram → Generate token for the connected Page |
| Meta (Messenger/Instagram) | `META_APP_SECRET` | Meta App Dashboard → your app → App settings → Basic → "App secret" |
| Meta (Messenger/Instagram) | `META_VERIFY_TOKEN` | Value you choose yourself, entered when registering the webhook callback URL |
| Any (if using `nlp/groq-parse`) | `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |

## API reference

| Export | Signature | Notes |
|---|---|---|
| `verifyWebhookSecret` | `(receivedHeader, expected) => boolean` | Telegram — plain equality check |
| `extractMessage` | `(update: TelegramUpdate) => IncomingMessage \| null` | Telegram — one update in, one message (or null) out |
| `sendTelegramMessage` | `(token, chatId, text, opts?) => Promise<void>` | Throws on non-2xx |
| `escapeMarkdown` | `(s: string) => string` | Telegram legacy Markdown escaping |
| `verifyLineWebhookSignature` | `(rawBody, signatureHeader, channelSecret) => Promise<boolean>` | LINE — HMAC-SHA256, base64; **pass the raw, unparsed body string** |
| `extractLineMessages` | `(body: LineWebhookBody) => IncomingLineMessage[]` | LINE — one delivery can batch several events, so this returns an array |
| `replyLineMessage` | `(channelAccessToken, replyToken, text) => Promise<void>` | Free; `replyToken` is single-use and short-lived |
| `pushLineMessage` | `(channelAccessToken, userId, text) => Promise<void>` | Counts against the free-tier quota |
| `getLineProfile` | `(channelAccessToken, userId) => Promise<LineProfile>` | Webhook events carry only `userId`, not a display name |
| `verifyWebhookChallenge` | `(query, verifyToken) => string \| null` | Meta — the one-time GET subscription handshake; echo the return value back as `200` plain text |
| `verifyMetaWebhookSignature` | `(rawBody, signatureHeader, appSecret) => Promise<boolean>` | Meta — HMAC-SHA256, hex, `sha256=` prefix; **pass the raw, unparsed body string** |
| `extractMetaMessages` | `(body: MetaWebhookBody) => IncomingMetaMessage[]` | Meta — covers Messenger + Instagram; filters out echoes and non-text events |
| `sendMetaMessage` | `(pageAccessToken, recipientId, text, opts?) => Promise<void>` | Meta Send API; same endpoint for Messenger and linked Instagram |
| `resolveOrCreateIdentity` | `<T>(store: ChatLinkStore<T>, chatId: ChatId, meta?) => Promise<T>` | Platform-agnostic; `ChatId = string \| number` |
| `dispatchCommand` | `<TContext>(text, commands, ctx, fallback) => Promise<void>` | Platform-agnostic; first match wins |
| `commandArgs` | `(text, command) => string` | Strips `"/cmd "` and trims the remainder |
| `parseTextToJSON` | `(opts: ParseTextToJSONOptions) => Promise<unknown>` | Groq only, for now; throws on a non-2xx response or an unparseable reply |

Exported types not listed above (`TelegramUpdate`, `IncomingMessage`,
`SendMessageOptions`, `LineEvent`, `LineWebhookBody`, `IncomingLineMessage`,
`LineProfile`, `MetaMessagingEvent`, `MetaWebhookBody`, `IncomingMetaMessage`,
`SendMetaMessageOptions`, `ChatId`, `ChatLinkStore`, `CommandMatcher`,
`CommandDefinition`, `ParseTextToJSONOptions`) are the parameter/return
shapes for the functions above — see the source file for each (all under
150 lines) for exact field docs.

## Development

```bash
pnpm --filter @gover-agent/chat-ops-core test         # vitest
pnpm --filter @gover-agent/chat-ops-core run type-check
```

Every exported function has a colocated `*.test.ts`. When adding a new
platform module (e.g. WhatsApp), mirror the `meta/` or `line/` folder shape —
a `webhook.ts` (verify + extract) and a `client.ts` (send) — reuse
`identity/`, `router/`, and `nlp/` unchanged, and **prefix new exports with
the platform name** (`verifyXWebhookSignature`, `extractXMessages`) since the
barrel (`src/index.ts`) does `export *` from every module and generic names
collide across platforms — that's why LINE's and Meta's functions are
prefixed instead of both being named `verifyWebhookSignature`.

## Why this exists

`apps/api/src/routes/telegram.ts` mixes two things: logic every Telegram bot
needs (auth, dispatch, onboarding, sending replies) and logic specific to this
trading bot (strategies, settings). This package is the first half, pulled out
so a *different* bot — e.g. a restaurant table-ordering bot — can reuse it
without copy-pasting or depending on `apps/api`.

## Using it in another program

Inside this monorepo: add `"@gover-agent/chat-ops-core": "workspace:*"` to
that app's `package.json` and import from `@gover-agent/chat-ops-core`.

In a completely separate project: copy the `packages/chat-ops-core` folder.
It has no dependency on anything else in this monorepo (only `typescript`,
`vitest`, and `@cloudflare/workers-types` as dev tooling) — drop it in, adjust
the `tsconfig.json` `extends` path (or point it at your own base config), and
it works standalone.

## Example: wiring a webhook handler (Hono + D1)

```ts
import { Hono } from 'hono'
import {
  verifyWebhookSecret,
  extractMessage,
  resolveOrCreateIdentity,
  dispatchCommand,
  commandArgs,
  sendTelegramMessage,
  parseTextToJSON,
  type ChatLinkStore,
} from '@gover-agent/chat-ops-core'

const app = new Hono<{ Bindings: { BOT_TOKEN: string; TELEGRAM_SECRET_TOKEN: string } }>()

app.post('/telegram', async (c) => {
  if (!verifyWebhookSecret(c.req.header('X-Telegram-Bot-Api-Secret-Token'), c.env.TELEGRAM_SECRET_TOKEN)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const msg = extractMessage(await c.req.json())
  if (!msg) return c.json({ ok: true })

  const store: ChatLinkStore = {
    find: (chatId) => myDb.findCustomerByChat(chatId),
    create: (chatId, meta) => myDb.createCustomer(chatId, meta.firstName),
  }
  const customerId = await resolveOrCreateIdentity(store, msg.chatId, { firstName: msg.firstName })

  await dispatchCommand(
    msg.text,
    [
      { match: '/menu', handler: () => sendTelegramMessage(c.env.BOT_TOKEN, msg.chatId, renderMenu()) },
      {
        match: (t) => t.startsWith('/order'),
        handler: async (t) => {
          const order = await parseTextToJSON({
            apiKey: c.env.GROQ_API_KEY,
            systemPrompt: ORDER_PARSE_PROMPT,
            userText: commandArgs(t, '/order'),
          })
          await myDb.createOrder(customerId, order)
          await sendTelegramMessage(c.env.BOT_TOKEN, msg.chatId, 'รับออเดอร์แล้ว ✅')
        },
      },
    ],
    customerId,
    (t) => sendTelegramMessage(c.env.BOT_TOKEN, msg.chatId, `ไม่รู้จักคำสั่ง "${t}"`)
  )

  return c.json({ ok: true })
})
```

Anything domain-specific — menu rendering, order validation, table-session
rules, payment — lives in the consuming app, not here.

## Example: wiring a LINE webhook handler (Hono + D1)

Same shape as the Telegram example — only the platform-specific import names
change. `resolveOrCreateIdentity`, `dispatchCommand`, `commandArgs`, and
`parseTextToJSON` are unchanged.

```ts
import { Hono } from 'hono'
import {
  verifyLineWebhookSignature,
  extractLineMessages,
  resolveOrCreateIdentity,
  dispatchCommand,
  commandArgs,
  replyLineMessage,
  getLineProfile,
  parseTextToJSON,
  type ChatLinkStore,
} from '@gover-agent/chat-ops-core'

const app = new Hono<{ Bindings: { LINE_CHANNEL_ACCESS_TOKEN: string; LINE_CHANNEL_SECRET: string } }>()

app.post('/line/webhook', async (c) => {
  // Must verify against the raw body text — don't parse-then-reserialize.
  const rawBody = await c.req.text()
  const signature = c.req.header('x-line-signature')
  if (!(await verifyLineWebhookSignature(rawBody, signature, c.env.LINE_CHANNEL_SECRET))) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const messages = extractLineMessages(JSON.parse(rawBody))

  for (const msg of messages) {
    const store: ChatLinkStore = {
      find: (userId) => myDb.findCustomerByLineUserId(String(userId)),
      create: async (userId) => {
        // Webhook events only carry userId — fetch the display name once, on onboarding.
        const profile = await getLineProfile(c.env.LINE_CHANNEL_ACCESS_TOKEN, String(userId))
        return myDb.createCustomer(String(userId), profile.displayName)
      },
    }
    const customerId = await resolveOrCreateIdentity(store, msg.userId)

    await dispatchCommand(
      msg.text,
      [
        {
          match: (t) => t.startsWith('/order'),
          handler: async (t) => {
            const order = await parseTextToJSON({
              apiKey: c.env.GROQ_API_KEY,
              systemPrompt: ORDER_PARSE_PROMPT,
              userText: commandArgs(t, '/order'),
            })
            await myDb.createOrder(customerId, order)
            await replyLineMessage(c.env.LINE_CHANNEL_ACCESS_TOKEN, msg.replyToken, 'รับออเดอร์แล้ว ✅')
          },
        },
      ],
      customerId,
      (t) => replyLineMessage(c.env.LINE_CHANNEL_ACCESS_TOKEN, msg.replyToken, `ไม่รู้จักคำสั่ง "${t}"`)
    )
  }

  return c.json({ ok: true })
})
```

## Example: wiring a Meta (Messenger/Instagram) webhook handler (Hono + D1)

Meta needs **two** routes: the one-time `GET` subscription handshake, and the
`POST` that receives events. Same `identity`/`router`/`nlp` calls as the other
two examples.

```ts
import { Hono } from 'hono'
import {
  verifyWebhookChallenge,
  verifyMetaWebhookSignature,
  extractMetaMessages,
  resolveOrCreateIdentity,
  dispatchCommand,
  commandArgs,
  sendMetaMessage,
  parseTextToJSON,
  type ChatLinkStore,
} from '@gover-agent/chat-ops-core'

const app = new Hono<{
  Bindings: { PAGE_ACCESS_TOKEN: string; META_APP_SECRET: string; META_VERIFY_TOKEN: string }
}>()

// One-time handshake — Meta calls this when you register the callback URL.
app.get('/meta/webhook', (c) => {
  const challenge = verifyWebhookChallenge(
    {
      'hub.mode': c.req.query('hub.mode'),
      'hub.verify_token': c.req.query('hub.verify_token'),
      'hub.challenge': c.req.query('hub.challenge'),
    },
    c.env.META_VERIFY_TOKEN
  )
  if (challenge === null) return c.text('Forbidden', 403)
  return c.text(challenge) // must be plain text, not JSON
})

app.post('/meta/webhook', async (c) => {
  const rawBody = await c.req.text()
  const signature = c.req.header('x-hub-signature-256')
  if (!(await verifyMetaWebhookSignature(rawBody, signature, c.env.META_APP_SECRET))) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const messages = extractMetaMessages(JSON.parse(rawBody))

  for (const msg of messages) {
    const store: ChatLinkStore = {
      find: (senderId) => myDb.findCustomerByMetaId(String(senderId)),
      create: (senderId) => myDb.createCustomer(String(senderId)),
    }
    const customerId = await resolveOrCreateIdentity(store, msg.senderId)

    await dispatchCommand(
      msg.text,
      [
        {
          match: (t) => t.startsWith('/order'),
          handler: async (t) => {
            const order = await parseTextToJSON({
              apiKey: c.env.GROQ_API_KEY,
              systemPrompt: ORDER_PARSE_PROMPT,
              userText: commandArgs(t, '/order'),
            })
            await myDb.createOrder(customerId, order)
            await sendMetaMessage(c.env.PAGE_ACCESS_TOKEN, msg.senderId, 'รับออเดอร์แล้ว ✅')
          },
        },
      ],
      customerId,
      (t) => sendMetaMessage(c.env.PAGE_ACCESS_TOKEN, msg.senderId, `ไม่รู้จักคำสั่ง "${t}"`)
    )
  }

  return c.json({ ok: true })
})
```
