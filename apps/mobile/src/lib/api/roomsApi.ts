import { API_BASE_URL } from "./config";

// Talks to backend/api-go's /api/rooms routes (see internal/feed/feed.go's
// room handlers) — Go owns every domain except auth, per DECISIONS.md →
// "Backend Domain Ownership — TypeScript Is Auth-Only".

export class RoomsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoomsApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  try {
    const body = (await res.json()) as { message?: string };
    throw new RoomsApiError(body.message ?? `Request failed (${res.status})`);
  } catch (e) {
    if (e instanceof RoomsApiError) throw e;
    throw new RoomsApiError(`Request failed (${res.status})`);
  }
}

export type ApiRoom = {
  id: string;
  name: string;
  memberCount: number;
  joined: boolean;
};

export type RoomMember = {
  id: string;
  name: string;
  verified: boolean;
  joinedAt: string;
};

export async function listRooms(token?: string): Promise<ApiRoom[]> {
  const res = await fetch(`${API_BASE_URL}/api/rooms`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { rooms: ApiRoom[] };
  return body.rooms;
}

export async function createRoom(token: string, name: string): Promise<ApiRoom> {
  const res = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { room: ApiRoom };
  return body.room;
}

export async function joinRoom(token: string, roomId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await parseError(res);
}

export async function leaveRoom(token: string, roomId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/leave`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await parseError(res);
}

export async function listRoomMembers(roomId: string): Promise<RoomMember[]> {
  const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/members`);
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { members: RoomMember[] };
  return body.members;
}
