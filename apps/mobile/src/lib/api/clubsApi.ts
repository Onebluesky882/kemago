import { API_BASE_URL } from "./config";

// Talks to backend/api-go's /api/clubs routes (see
// backend/api-go/internal/clubs/clubs.go) — Go owns every domain except
// auth, per DECISIONS.md → "Backend Domain Ownership — TypeScript Is
// Auth-Only".

export class ClubsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClubsApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  try {
    const body = (await res.json()) as { message?: string };
    throw new ClubsApiError(body.message ?? `Request failed (${res.status})`);
  } catch (e) {
    if (e instanceof ClubsApiError) throw e;
    throw new ClubsApiError(`Request failed (${res.status})`);
  }
}

export type ApiClub = {
  id: string;
  name: string;
  description: string;
  category: string;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  joined: boolean;
  createdAt: string;
};

export async function listClubs(): Promise<ApiClub[]> {
  const res = await fetch(`${API_BASE_URL}/api/clubs`);
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { clubs: ApiClub[] };
  return body.clubs;
}

export async function createClub(
  token: string,
  input: { name: string; description?: string; category?: string },
): Promise<ApiClub> {
  const res = await fetch(`${API_BASE_URL}/api/clubs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { club: ApiClub };
  return body.club;
}

export async function joinClub(token: string, id: string): Promise<ApiClub> {
  const res = await fetch(`${API_BASE_URL}/api/clubs/${id}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { club: ApiClub };
  return body.club;
}

export async function leaveClub(token: string, id: string): Promise<ApiClub> {
  const res = await fetch(`${API_BASE_URL}/api/clubs/${id}/leave`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { club: ApiClub };
  return body.club;
}

export async function changeLeader(token: string, id: string, userId: string): Promise<ApiClub> {
  const res = await fetch(`${API_BASE_URL}/api/clubs/${id}/leader`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { club: ApiClub };
  return body.club;
}

export type ClubMember = {
  id: string;
  name: string;
  verified: boolean;
  joinedAt: string;
};

export async function listClubMembers(id: string): Promise<ClubMember[]> {
  const res = await fetch(`${API_BASE_URL}/api/clubs/${id}/members`);
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { members: ClubMember[] };
  return body.members;
}
