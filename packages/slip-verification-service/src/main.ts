import 'dotenv/config';
import { timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { loadConfig } from './config.js';
import { createSlip2GoClient, matchesWallet, type Slip2GoClient } from './slip2go/client.js';

const config = loadConfig();

const client = createSlip2GoClient(config.slip2goApiUrl, config.slip2goSecret);
if (!client) {
  console.error('SLIP_2GO_SECRET is not configured');
  process.exit(1);
}
if (!config.internalSecret) {
  console.error('INTERNAL_SECRET is not configured');
  process.exit(1);
}

interface VerifySlipRequestBody {
  qrCode?: string;
  walletAccountNumber?: string;
}

const server = createServer((req, res) => {
  void handleRequest(req, res, client, config.internalSecret);
});

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  slip2go: Slip2GoClient,
  internalSecret: string,
): Promise<void> {
  if (req.method === 'GET' && req.url === '/healthz') {
    writeJSON(res, 200, { status: 'ok' });
    return;
  }

  if (req.method === 'POST' && req.url === '/v1/verify-slip') {
    await verifySlipHandler(req, res, slip2go, internalSecret);
    return;
  }

  writeJSON(res, 404, { error: 'not found' });
}

// verifySlipHandler decodes a scanned slip QR code via Slip2Go and, if
// walletAccountNumber is supplied, reports whether the slip's receiver
// matches it (see matchesWallet). Callers are still responsible for checking
// the transferred amount against the expected price themselves.
async function verifySlipHandler(
  req: IncomingMessage,
  res: ServerResponse,
  slip2go: Slip2GoClient,
  internalSecret: string,
): Promise<void> {
  if (!hasValidInternalSecret(req.headers['x-internal-secret'], internalSecret)) {
    writeJSON(res, 403, { error: 'forbidden' });
    return;
  }

  let body: VerifySlipRequestBody;
  try {
    body = JSON.parse(await readBody(req)) as VerifySlipRequestBody;
  } catch {
    writeJSON(res, 400, { error: 'invalid request body' });
    return;
  }

  if (!body.qrCode) {
    writeJSON(res, 400, { error: 'qrCode is required' });
    return;
  }

  try {
    const info = await slip2go.getSlipInfo(body.qrCode);
    const response: Record<string, unknown> = {
      transRef: info.transRef,
      amount: info.amount,
      receiverName: info.receiverName,
      receiverLast4: info.receiverLast4,
      raw: info.raw,
    };
    if (body.walletAccountNumber) {
      response.matchesWallet = matchesWallet(info, body.walletAccountNumber);
    }
    writeJSON(res, 200, response);
  } catch (err) {
    writeJSON(res, 502, { error: (err as Error).message });
  }
}

function hasValidInternalSecret(header: string | string[] | undefined, secret: string): boolean {
  const got = Buffer.from(typeof header === 'string' ? header : '', 'utf8');
  const want = Buffer.from(secret, 'utf8');
  if (got.length !== want.length) return false;
  return timingSafeEqual(got, want);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function writeJSON(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

server.listen(Number(config.port), () => {
  console.log(`slip-verification-service listening on :${config.port}`);
});

function shutdown(): void {
  console.log('shutting down...');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
