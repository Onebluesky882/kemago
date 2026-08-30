import { API_BASE_URL } from "./config";

// Talks to backend/api-go's /api/posts/:id/poll routes (see
// backend/api-go/internal/polls/polls.go) — Go owns every domain except
// auth, per DECISIONS.md → "Backend Domain Ownership — TypeScript Is
// Auth-Only". Same fetch-wrapper shape as postsApi.ts.

export class PollsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PollsApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  try {
    const body = (await res.json()) as { message?: string };
    throw new PollsApiError(body.message ?? `Request failed (${res.status})`);
  } catch (e) {
    if (e instanceof PollsApiError) throw e;
    throw new PollsApiError(`Request failed (${res.status})`);
  }
}

export type ApiPollOption = {
  id: string;
  label: string;
  voteCount: number;
};

export type ApiPoll = {
  id: string;
  postId: string;
  question: string;
  options: ApiPollOption[];
  totalVotes: number;
  myVoteOptionId: string | null;
};

// Distinguishes "this post genuinely has no poll" (404 from the backend)
// from a real network/server failure so callers can render a plain post
// instead of an error state.
export class PollNotFoundError extends PollsApiError {
  constructor() {
    super("This post has no poll");
    this.name = "PollNotFoundError";
  }
}

export async function createPoll(
  token: string,
  postId: string,
  input: { question: string; options: string[] },
): Promise<ApiPoll> {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/poll`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { poll: ApiPoll };
  return body.poll;
}

export async function getPoll(postId: string, token?: string): Promise<ApiPoll> {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/poll`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (res.status === 404) throw new PollNotFoundError();
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { poll: ApiPoll };
  return body.poll;
}

export async function votePoll(token: string, postId: string, optionId: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/poll/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ optionId }),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { optionId: string };
  return body.optionId;
}
