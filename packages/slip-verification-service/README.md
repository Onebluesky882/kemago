# slip-verification-service

Standalone HTTP wrapper around Slip2Go's bank-slip QR verification API, so
any service (Go, Node, Python, ...) can verify a slip without holding its own
Slip2Go secret.

## Run

```bash
cp .env.example .env   # fill in SLIP_2GO_SECRET and INTERNAL_SECRET
pnpm install
pnpm dev
```

## API

Every request except `/healthz` must include the shared secret:

```
X-Internal-Secret: <INTERNAL_SECRET>
```

### `GET /healthz`

No auth required. Returns `{"status": "ok"}`.

### `POST /v1/verify-slip`

Request body:

```json
{
  "qrCode": "00020101...",
  "walletAccountNumber": "1234567890"
}
```

`walletAccountNumber` is optional — omit it to just decode the slip.

Response `200`:

```json
{
  "transRef": "...",
  "amount": 500,
  "receiverName": "นาย...",
  "receiverLast4": "9882",
  "matchesWallet": true,
  "raw": { "...": "Slip2Go's raw response, for audit logging" }
}
```

`matchesWallet` is present only when `walletAccountNumber` was supplied. It
compares the last 4 digits of the receiver's bank account / PromptPay proxy
number only — callers still need to check the transferred amount against
their own expected price.

Error responses: `400` bad request, `403` missing/invalid internal secret,
`502` Slip2Go lookup failed (slip not found, package expired, etc. — see
`error` field for Slip2Go's message).
