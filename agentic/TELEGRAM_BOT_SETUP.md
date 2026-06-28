# Telegram Bot Setup

## ขั้นตอน (Client)

### 1. สร้าง Bot ใหม่
เปิด Telegram แล้วคุยกับ @BotFather:
```
/newbot
```
ตั้งชื่อ → รับ **BOT_TOKEN** (รูปแบบ `7812345678:AAH...`)

---

### 2. สร้าง Secret Token
```bash
openssl rand -hex 16
```
คัดลอกผลลัพธ์ไว้ใช้เป็น **TELEGRAM_SECRET_TOKEN**

---

### 3. ตั้ง Secrets ใน Worker
```bash
cd apps/api

wrangler secret put BOT_TOKEN
# วาง token จาก BotFather แล้วกด Enter

wrangler secret put TELEGRAM_SECRET_TOKEN
# วาง hex string จากขั้นตอน 2 แล้วกด Enter
```

ตรวจสอบ:
```bash
wrangler secret list
# ควรเห็น BOT_TOKEN และ TELEGRAM_SECRET_TOKEN
```

---

### 4. Deploy Worker
```bash
wrangler deploy
```

---

### 5. ลงทะเบียน Webhook กับ Telegram
แทนค่าจริงในคำสั่งด้านล่าง:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook\
?url=https://<YOUR_WORKER>.workers.dev/webhook/telegram\
&secret_token=<TELEGRAM_SECRET_TOKEN>"
```

ผลลัพธ์ที่ถูกต้อง:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

---

### 6. ทดสอบ
พิมพ์ `/help` ในบอทของคุณ — ควรได้รับข้อความตอบกลับ

---

## Webhook Endpoint

| Method | Path | ใช้ทำอะไร |
|--------|------|-----------|
| POST | `/webhook/telegram` | รับ update จาก Telegram |
| POST | `/webhook/notify` | ส่ง notification จาก code อื่น |

## เพิ่ม Command ใหม่

แก้ไขที่ `apps/api/src/domains/telegram/telegram.route.ts`:

```ts
if (text === '/mycommand') {
  await sendMessage(c.env.BOT_TOKEN, chatId, 'ข้อความตอบกลับ')
  return c.json({ ok: true })
}
```

## ส่ง Notification จาก Route อื่น

```ts
import { sendTelegramMessage } from '../telegram/telegram.service'

// ในตอน payment สำเร็จ เป็นต้น
await sendTelegramMessage(c.env.BOT_TOKEN, OWNER_CHAT_ID, '✅ มีการชำระเงินใหม่')
```
