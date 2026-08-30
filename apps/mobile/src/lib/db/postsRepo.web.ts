import type { Post } from "../mockData";

// Browser equivalent of postsRepo.native.ts — react-native-nitro-sqlite has
// no web build, so the web bundle needs its own local-first storage here.
// Same exported function shapes as the native file; callers import the
// extensionless "./postsRepo" and Metro resolves whichever file matches
// the platform being bundled.

const POSTS_KEY = "kemago:posts";
const OUTBOX_KEY = "kemago:sync_outbox";

type OutboxEntry = {
  id: string;
  entityType: string;
  entityId: string;
  operation: "insert" | "update" | "delete";
  payload: string;
  createdAt: string;
};

function readPosts(): Post[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    return raw ? (JSON.parse(raw) as Post[]) : [];
  } catch {
    return [];
  }
}

function writePosts(posts: Post[]) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch {
    // Storage unavailable (private browsing, quota) — fail silently like a
    // cache miss; the in-memory screen state still works for this session.
  }
}

function readOutbox(): OutboxEntry[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? (JSON.parse(raw) as OutboxEntry[]) : [];
  } catch {
    return [];
  }
}

function writeOutbox(entries: OutboxEntry[]) {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(entries));
  } catch {
    // See writePosts — non-fatal.
  }
}

export async function initPostsStore(seed: Post[]): Promise<void> {
  if (readPosts().length === 0) {
    writePosts(seed);
  }
}

export async function getAllPosts(): Promise<Post[]> {
  return readPosts();
}

export async function insertPost(post: Post): Promise<void> {
  writePosts([post, ...readPosts()]);
  writeOutbox([
    ...readOutbox(),
    {
      id: `ob_${Date.now()}_${post.id}`,
      entityType: "post",
      entityId: post.id,
      operation: "insert",
      payload: JSON.stringify(post),
      createdAt: new Date().toISOString(),
    },
  ]);
}

export async function getPendingSyncCount(): Promise<number> {
  return readOutbox().length;
}
