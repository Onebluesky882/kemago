import { API_BASE_URL } from "./config";

// Talks to backend/api-go's /api/stories routes (internal/stories) —
// presigned-URL upload flow: this app never sends file bytes to the
// backend, it uploads straight to R2 using a signed URL the backend
// hands out, then registers the resulting story separately. See
// DECISIONS.md → "Backend Domain Ownership — TypeScript Is Auth-Only".

export class StoriesApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoriesApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  try {
    const body = (await res.json()) as { message?: string };
    throw new StoriesApiError(body.message ?? `Request failed (${res.status})`);
  } catch (e) {
    if (e instanceof StoriesApiError) throw e;
    throw new StoriesApiError(`Request failed (${res.status})`);
  }
}

export type MediaType = "image" | "video";

export type ApiStory = {
  id: string;
  authorId: string;
  author: string;
  authorVerified: boolean;
  mediaUrl: string;
  mediaType: MediaType;
  createdAt: string;
  expiresAt: string;
};

async function getUploadUrl(
  token: string,
  input: { mediaType: MediaType; contentType: string },
): Promise<{ uploadUrl: string; objectKey: string }> {
  const res = await fetch(`${API_BASE_URL}/api/stories/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

async function registerStory(token: string, input: { objectKey: string; mediaType: MediaType }): Promise<ApiStory> {
  const res = await fetch(`${API_BASE_URL}/api/stories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { story: ApiStory };
  return body.story;
}

// The full three-step flow: ask the backend for a place to upload, PUT the
// raw file straight to R2 (never through this backend), then tell the
// backend the upload succeeded so it can create the story row. If the PUT
// itself fails (e.g. R2 not configured/reachable), this throws before
// ever calling registerStory — no orphaned metadata for a file that isn't
// actually there.
export async function uploadStory(
  token: string,
  input: { uri: string; mediaType: MediaType; contentType: string },
): Promise<ApiStory> {
  const { uploadUrl, objectKey } = await getUploadUrl(token, {
    mediaType: input.mediaType,
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
    throw new StoriesApiError(`Upload to storage failed (${putRes.status})`);
  }

  return registerStory(token, { objectKey, mediaType: input.mediaType });
}

export async function listStories(): Promise<ApiStory[]> {
  const res = await fetch(`${API_BASE_URL}/api/stories`);
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { stories: ApiStory[] };
  return body.stories;
}
