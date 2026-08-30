import { API_BASE_URL } from "./config";

// Talks to backend/api-go's /api/blocks routes (see
// backend/api-go/internal/blocks/blocks.go) — Go owns every domain except
// auth, per DECISIONS.md → "Backend Domain Ownership — TypeScript Is
// Auth-Only". Same client shape as lib/api/postsApi.ts.

export class BlocksApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlocksApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  try {
    const body = (await res.json()) as { message?: string };
    throw new BlocksApiError(body.message ?? `Request failed (${res.status})`);
  } catch (e) {
    if (e instanceof BlocksApiError) throw e;
    throw new BlocksApiError(`Request failed (${res.status})`);
  }
}

export type BlockedUser = {
  id: string;
  name: string;
  blockedAt: string;
};

export async function blockUser(token: string, userId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/blocks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) await parseError(res);
}

export async function unblockUser(token: string, userId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/blocks/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await parseError(res);
}

export async function listBlocked(token: string): Promise<BlockedUser[]> {
  const res = await fetch(`${API_BASE_URL}/api/blocks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { blocked: BlockedUser[] };
  return body.blocked;
}
