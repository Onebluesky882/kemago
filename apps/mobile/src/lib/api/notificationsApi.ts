import { API_BASE_URL } from "./config";

// Talks to backend/api-go's /api/notifications routes (see
// backend/api-go/internal/notifications/notifications.go) — persisted
// history of things that happened to the signed-in user (friend
// request/accept, a comment or like on their post), separate from the
// live websocket push in lib/realtime.ts (that's fire-and-forget; this is
// the catch-up path for when the user wasn't connected at the time).

export class NotificationsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationsApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  try {
    const body = (await res.json()) as { message?: string };
    throw new NotificationsApiError(body.message ?? `Request failed (${res.status})`);
  } catch (e) {
    if (e instanceof NotificationsApiError) throw e;
    throw new NotificationsApiError(`Request failed (${res.status})`);
  }
}

export type NotificationKind = "friend_request" | "friend_accepted" | "comment" | "like";

export type ApiNotification = {
  id: string;
  kind: NotificationKind;
  actorId: string;
  actorName: string;
  postId?: string;
  read: boolean;
  createdAt: string;
};

export async function listNotifications(
  token: string,
): Promise<{ notifications: ApiNotification[]; unreadCount: number }> {
  const res = await fetch(`${API_BASE_URL}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function markNotificationRead(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await parseError(res);
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await parseError(res);
}
