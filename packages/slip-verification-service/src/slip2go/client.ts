// Wraps Slip2Go's bank-slip verification API
// (https://connect.slip2go.com/api/verify-slip/qr-code/info).

export interface SlipInfo {
  transRef: string;
  amount: number;
  /** as returned by Slip2Go — may include a title (นาย/นาง) and be truncated */
  receiverName: string;
  /** last 4 digits of whichever receiver identifier Slip2Go returned (bank account or proxy/PromptPay number) */
  receiverLast4: string;
  raw: unknown;
}

interface Slip2GoEnvelope {
  code: string;
  message: string;
  data?: {
    transRef: string;
    amount: number;
    receiver?: {
      account?: {
        name: string;
        bank?: { account?: string | null };
        proxy?: { account?: string };
      };
    };
  };
}

// Matching against a wallet's registered account is done in our own code
// (see matchesWallet) rather than via Slip2Go's checkCondition —
// checkCondition's accountNumber match fails in practice against a
// PromptPay-proxy receiver (bank.account is null for those; only the masked
// proxy number is available), and Slip2Go truncates receiver names, so exact
// matching there doesn't work for this case.
export class Slip2GoClient {
  constructor(
    private readonly apiUrl: string,
    private readonly secret: string,
  ) {}

  // Decodes a scanned slip QR code via Slip2Go — no checkCondition is sent;
  // matching against a specific wallet is done by the caller via matchesWallet.
  async getSlipInfo(qrCode: string): Promise<SlipInfo> {
    let response: Response;
    try {
      response = await fetch(`${this.apiUrl}/api/verify-slip/qr-code/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.secret}`,
        },
        body: JSON.stringify({ payload: { qrCode } }),
      });
    } catch (err) {
      throw new Error(`slip2go request failed: ${(err as Error).message}`);
    }

    // The HTTP status alone is not enough — Slip2Go returns 200 or 400 for a
    // not-found/bad slip and 401 for an account/package error, always with
    // its own `code` field in the body ("200000" on success).
    const envelope = (await response.json().catch(() => ({}) as Slip2GoEnvelope)) as Slip2GoEnvelope;

    if (envelope.code !== '200000') {
      throw new Error(envelope.message ?? 'slip2go lookup failed');
    }

    const data = envelope.data!;
    const account = data.receiver?.account;
    const receiverAccount = account?.bank?.account || account?.proxy?.account || '';

    return {
      transRef: data.transRef,
      amount: data.amount,
      receiverName: account?.name ?? '',
      receiverLast4: last4Digits(receiverAccount),
      raw: envelope,
    };
  }
}

// last4Digits returns the last 4 digits of s, ignoring any non-digit
// characters (masking like "09xxxx9882" still yields "9882").
function last4Digits(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length <= 4 ? digits : digits.slice(-4);
}

// Reports whether this slip's receiver matches the given wallet's registered
// account. Deliberately does NOT compare receiver name — Slip2Go's name is
// Thai-title-prefixed and truncated, and receivers can be foreign nationals
// with English names, so name matching isn't a reliable signal here.
// Matching is last-4-digits of the account/PromptPay number — callers
// separately check the transferred amount against the expected price.
export function matchesWallet(slip: SlipInfo, walletAccountNumber: string): boolean {
  return slip.receiverLast4 !== '' && slip.receiverLast4 === last4Digits(walletAccountNumber);
}

// Returns null if secret is empty — callers must treat a null client as
// "Slip2Go not configured" and skip verification.
export function createSlip2GoClient(apiUrl: string, secret: string): Slip2GoClient | null {
  if (!secret) return null;
  return new Slip2GoClient(apiUrl.replace(/\/+$/, ''), secret);
}
