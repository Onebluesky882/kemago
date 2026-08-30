import { API_BASE_URL } from "./config";

// Talks to backend/api-go's /api/friends routes (see
// backend/api-go/internal/friends/friends.go) — Go owns every domain
// except auth, per DECISIONS.md → "Backend Domain Ownership — TypeScript
// Is Auth-Only".

export class FriendsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FriendsApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  try {
    const body = (await res.json()) as { message?: string };
    throw new FriendsApiError(body.message ?? `Request failed (${res.status})`);
  } catch (e) {
    if (e instanceof FriendsApiError) throw e;
    throw new FriendsApiError(`Request failed (${res.status})`);
  }
}

export type FriendEntry = {
  userId: string;
  name: string;
  verified: boolean;
  createdAt: string;
};

async function post(token: string, path: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

// Sending a request to someone who already requested you resolves to an
// immediate "accepted" — see friends.go's sendRequest for why.
export async function sendFriendRequest(token: string, userId: string): Promise<{ status: "pending" | "accepted" }> {
  return post(token, "/api/friends/requests", { userId }) as Promise<{ status: "pending" | "accepted" }>;
}

export async function acceptFriendRequest(token: string, userId: string): Promise<void> {
  await post(token, `/api/friends/requests/${userId}/accept`);
}

export async function declineFriendRequest(token: string, userId: string): Promise<void> {
  await post(token, `/api/friends/requests/${userId}/decline`);
}

// Also cancels a pending request you sent, not just an accepted friendship.
export async function removeFriend(token: string, userId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/friends/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await parseError(res);
}

export async function listFriends(token: string): Promise<FriendEntry[]> {
  const res = await fetch(`${API_BASE_URL}/api/friends`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { friends: FriendEntry[] };
  return body.friends;
}

export async function listIncomingRequests(token: string): Promise<FriendEntry[]> {
  const res = await fetch(`${API_BASE_URL}/api/friends/requests`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { requests: FriendEntry[] };
  return body.requests;
}
