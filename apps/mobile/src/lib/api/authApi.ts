import { API_BASE_URL } from "./config";

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  try {
    const body = (await res.json()) as { error?: string };
    throw new AuthApiError(body.error ?? `Request failed (${res.status})`);
  } catch (e) {
    if (e instanceof AuthApiError) throw e;
    throw new AuthApiError(`Request failed (${res.status})`);
  }
}

export async function requestOtp(phone: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/otp/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) await parseError(res);
}

export async function verifyOtp(phone: string, code: string): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE_URL}/api/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  if (!res.ok) await parseError(res);
  return (await res.json()) as { token: string };
}
