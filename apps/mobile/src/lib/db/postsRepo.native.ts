import { open } from "react-native-nitro-sqlite";
import type { Post } from "../mockData";

// Local-first storage: the Feed screen reads/writes here first, and this
// module queues every write into sync_outbox for the background sync
// engine to push once a real API exists. See src/lib/sync/syncEngine.ts.
//
// react-native-nitro-sqlite is a native-only NitroModule (no web build) —
// see postsRepo.web.ts for the browser-side equivalent with the same
// exported function shapes. Metro resolves whichever one matches the
// platform being bundled.

const db = open({ name: "kemago.db" });

let migrated = false;

function migrate() {
  if (migrated) return;
  db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL,
      author_verified INTEGER NOT NULL DEFAULT 0,
      neighborhood TEXT NOT NULL,
      category TEXT NOT NULL,
      body TEXT NOT NULL,
      posted_at TEXT NOT NULL,
      like_count INTEGER NOT NULL DEFAULT 0,
      reply_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.execute(`
    CREATE TABLE IF NOT EXISTS sync_outbox (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  migrated = true;
}

type PostRow = {
  id: string;
  author_id: string;
  author: string;
  author_verified: number;
  neighborhood: string;
  category: Post["category"];
  body: string;
  posted_at: string;
  like_count: number;
  reply_count: number;
};

function fromRow(row: PostRow): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    author: row.author,
    authorVerified: row.author_verified === 1,
    neighborhood: row.neighborhood,
    category: row.category,
    body: row.body,
    postedAt: row.posted_at,
    likeCount: row.like_count,
    replyCount: row.reply_count,
  };
}

function insertRow(post: Post) {
  db.execute(
    `INSERT OR REPLACE INTO posts
      (id, author_id, author, author_verified, neighborhood, category, body, posted_at, like_count, reply_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      post.id,
      post.authorId,
      post.author,
      post.authorVerified ? 1 : 0,
      post.neighborhood,
      post.category,
      post.body,
      post.postedAt,
      post.likeCount,
      post.replyCount,
    ],
  );
}

function enqueueOutbox(post: Post) {
  db.execute(
    `INSERT INTO sync_outbox (id, entity_type, entity_id, operation, payload, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [`ob_${Date.now()}_${post.id}`, "post", post.id, "insert", JSON.stringify(post), new Date().toISOString()],
  );
}

export async function initPostsStore(seed: Post[]): Promise<void> {
  migrate();
  const { rows } = db.execute<{ count: number }>("SELECT COUNT(*) as count FROM posts");
  const count = rows?.item(0)?.count ?? 0;
  if (count === 0) {
    for (const post of seed) {
      insertRow(post);
    }
  }
}

export async function getAllPosts(): Promise<Post[]> {
  migrate();
  const { rows } = db.execute<PostRow>("SELECT * FROM posts ORDER BY created_at DESC");
  return (rows?._array ?? []).map(fromRow);
}

export async function insertPost(post: Post): Promise<void> {
  migrate();
  insertRow(post);
  enqueueOutbox(post);
}

export async function getPendingSyncCount(): Promise<number> {
  migrate();
  const { rows } = db.execute<{ count: number }>("SELECT COUNT(*) as count FROM sync_outbox");
  return rows?.item(0)?.count ?? 0;
}
