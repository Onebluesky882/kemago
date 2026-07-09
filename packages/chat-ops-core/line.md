วิธีเชื่อมต่อและทดลอง LINE API

1. สร้าง LINE Official Account + Channel

1. ไปที่ LINE Developers Console (https://developers.line.biz/console/) → ล็อกอินด้วย LINE account ปกติ
2. สร้าง Provider ใหม่ (ตั้งชื่อบริษัท/ร้าน)
3. ในนั้นสร้าง Channel ประเภท Messaging API
4. เข้าไปที่ channel ที่สร้าง → แท็บ Messaging API:
  - เลื่อนลงหา Channel access token → กด Issue เพื่อออก token (ยาว, ใช้เป็น LINE_CHANNEL_ACCESS_TOKEN)
  - แท็บ Basic settings → หา Channel secret (ใช้เป็น LINE_CHANNEL_SECRET)

2. ตั้งค่า Webhook URL

1. ยังอยู่แท็บ Messaging API → Webhook settings → ใส่ URL ปลายทาง เช่น https://your-worker.workers.dev/line/webhook
2. เปิด toggle Use webhook เป็น ON
3. ปิด "Auto-reply messages" และ "Greeting messages" ในแท็บ Messaging API (ไม่งั้น LINE จะตอบเองซ้อนกับ bot ของเรา)
4. กด Verify — ถ้า endpoint ยังไม่มีจะ error ปกติ ข้ามไปทำ endpoint ก่อนแล้วค่อยกลับมากด verify

3. เขียน route จริง (ใช้ chat-ops-core ที่เพิ่งสร้าง)
