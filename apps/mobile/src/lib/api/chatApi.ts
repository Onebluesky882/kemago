import { API_BASE_URL } from "./config";

// Talks to backend/api-go's /api/conversations routes (see
// backend/api-go/internal/chat/chat.go) — Go owns every domain except
// auth, per DECISIONS.md → "Backend Domain Ownership — TypeScript Is
// Auth-Only". A 1:1 DM and a group chat are the same "conversation" shape
// server-side (type: "dm" | "group") — there's no separate DM API.

export class ChatApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  try {
    const body = (await res.json()) as { message?: string };
    throw new ChatApiError(body.message ?? `Request failed (${res.status})`);
  } catch (e) {
    if (e instanceof ChatApiError) throw e;
    throw new ChatApiError(`Request failed (${res.status})`);
  }
}

export type ConversationType = "dm" | "group";

export type ApiConversation = {
  id: string;
  type: ConversationType;
  name: string;
  memberCount: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
  otherUser: { id: string; name: string } | null;
  createdAt: string;
};

export type ApiMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
};

export type ConversationMember = {
  id: string;
  name: string;
  role: "owner" | "member";
  joinedAt: string;
  lastReadAt: string;
};

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function listConversations(token: string): Promise<ApiConversation[]> {
  const res = await fetch(`${API_BASE_URL}/api/conversations`, { headers: authHeaders(token) });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { conversations: ApiConversation[] };
  return body.conversations;
}

export async function createDirectConversation(token: string, userId: string): Promise<ApiConversation> {
  const res = await fetch(`${API_BASE_URL}/api/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ type: "dm", userId }),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { conversation: ApiConversation };
  return body.conversation;
}

export async function createGroupConversation(
  token: string,
  input: { name: string; memberIds: string[] },
): Promise<ApiConversation> {
  const res = await fetch(`${API_BASE_URL}/api/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ type: "group", name: input.name, memberIds: input.memberIds }),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { conversation: ApiConversation };
  return body.conversation;
}

export async function listMessages(
  token: string,
  conversationId: string,
  opts?: { before?: string; limit?: number },
): Promise<ApiMessage[]> {
  const params = new URLSearchParams();
  if (opts?.before) params.set("before", opts.before);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  const res = await fetch(
    `${API_BASE_URL}/api/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`,
    { headers: authHeaders(token) },
  );
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { messages: ApiMessage[] };
  return body.messages;
}

export async function sendMessage(
  token: string,
  conversationId: string,
  input: { content?: string; imageKey?: string },
): Promise<ApiMessage> {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { message: ApiMessage };
  return body.message;
}

async function getChatUploadUrl(
  token: string,
  conversationId: string,
  input: { mediaType: "image"; contentType: string },
): Promise<{ uploadUrl: string; objectKey: string }> {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<{ uploadUrl: string; objectKey: string }>;
}

// Presigned-URL upload flow, same shape as lib/api/storiesApi.ts's
// uploadStory: never send file bytes to our own backend, PUT straight to
// R2 using the signed URL, then reference the resulting objectKey when
// creating the message.
export async function sendImageMessage(
  token: string,
  conversationId: string,
  input: { uri: string; contentType: string; content?: string },
): Promise<ApiMessage> {
  const { uploadUrl, objectKey } = await getChatUploadUrl(token, conversationId, {
    mediaType: "image",
    contentType: input.contentType,
  });

  const fileRes = await fetch(input.uri);
  const blob = await fileRes.blob();

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": input.contentType },
    body: blob,
  });
  if (!putRes.ok) {
    throw new ChatApiError(`Upload to storage failed (${putRes.status})`);
  }

  return sendMessage(token, conversationId, { content: input.content, imageKey: objectKey });
}

export async function listConversationMembers(
  token: string,
  conversationId: string,
): Promise<ConversationMember[]> {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/members`, {
    headers: authHeaders(token),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { members: ConversationMember[] };
  return body.members;
}

export async function inviteToConversation(
  token: string,
  conversationId: string,
  userId: string,
): Promise<ApiConversation> {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { conversation: ApiConversation };
  return body.conversation;
}

export async function markConversationRead(token: string, conversationId: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/read`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { readAt: string };
  return body.readAt;
}

export async function leaveConversation(token: string, conversationId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/leave`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) await parseError(res);
}
