import { API_BASE_URL } from "./config";
import type { Category } from "../mockData";

// Talks to backend/api-go's /api/posts routes (see
// backend/api-go/internal/feed/feed.go) — Go owns every domain except auth,
// per DECISIONS.md → "Backend Domain Ownership — TypeScript Is Auth-Only".

export class PostsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PostsApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  try {
    const body = (await res.json()) as { message?: string };
    throw new PostsApiError(body.message ?? `Request failed (${res.status})`);
  } catch (e) {
    if (e instanceof PostsApiError) throw e;
    throw new PostsApiError(`Request failed (${res.status})`);
  }
}

export type ApiPost = {
  id: string;
  authorId: string;
  author: string;
  authorVerified: boolean;
  category: Category;
  body: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
};

export type ApiComment = {
  id: string;
  author: string;
  authorVerified: boolean;
  body: string;
  createdAt: string;
};

export async function listPosts(): Promise<ApiPost[]> {
  const res = await fetch(`${API_BASE_URL}/api/posts`);
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { posts: ApiPost[] };
  return body.posts;
}

export async function getPost(id: string): Promise<ApiPost> {
  const res = await fetch(`${API_BASE_URL}/api/posts/${id}`);
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { post: ApiPost };
  return body.post;
}

export async function createPost(
  token: string,
  input: { roomId?: string; category: Category; body: string },
): Promise<ApiPost> {
  const res = await fetch(`${API_BASE_URL}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { post: ApiPost };
  return body.post;
}

export async function listComments(postId: string): Promise<ApiComment[]> {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`);
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { comments: ApiComment[] };
  return body.comments;
}

export async function createComment(token: string, postId: string, body: string): Promise<ApiComment> {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) await parseError(res);
  const responseBody = (await res.json()) as { comment: ApiComment };
  return responseBody.comment;
}
