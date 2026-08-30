import type { IncomingMessage, ServerResponse } from "node:http";
import { desc, eq, sql } from "drizzle-orm";
import { auth, db } from "../auth";
import { comment, post, user } from "../db/schema";

// Feed: posts + comments. This service is the only live backend, so these
// routes live next to Better Auth's own handler in server.ts rather than a
// separate service — same reasoning as everything else living under
// backend/ (see PIPELINE.md stage-12-backend-otp-scaffold).

// Returns true so route handlers below can `return json(...)` directly as
// their "request handled" signal back to handlePostsRoute's caller.
function json(res: ServerResponse, status: number, body: unknown): true {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(body));
  return true;
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

async function requireUserId(req: IncomingMessage): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: new Headers({ authorization: req.headers.authorization ?? "" }),
  });
  return session?.user.id ?? null;
}

// authorVerified is read live from user.emailVerified — there's no real
// identity-verification (KYC/face-scan) system yet, see
// coarea_product_rules memory's "Open TODO — identity verification method".
// This is an interim, honest proxy using a field that already exists,
// not a stand-in for the eventual real feature.
type PostOut = {
  id: string;
  author: string;
  authorVerified: boolean;
  category: string;
  body: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
};

type CommentOut = {
  id: string;
  author: string;
  authorVerified: boolean;
  body: string;
  createdAt: string;
};

async function listPosts(): Promise<PostOut[]> {
  const rows = await db
    .select({
      id: post.id,
      category: post.category,
      body: post.body,
      likeCount: post.likeCount,
      createdAt: post.createdAt,
      authorName: user.name,
      authorVerified: user.emailVerified,
    })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .orderBy(desc(post.createdAt));

  const counts = await db
    .select({ postId: comment.postId, count: sql<number>`count(*)::int` })
    .from(comment)
    .groupBy(comment.postId);
  const countByPost = new Map(counts.map((c) => [c.postId, c.count]));

  return rows.map((r) => ({
    id: r.id,
    author: r.authorName,
    authorVerified: r.authorVerified,
    category: r.category,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    likeCount: r.likeCount,
    replyCount: countByPost.get(r.id) ?? 0,
  }));
}

async function getPost(id: string): Promise<PostOut | null> {
  const rows = await db
    .select({
      id: post.id,
      category: post.category,
      body: post.body,
      likeCount: post.likeCount,
      createdAt: post.createdAt,
      authorName: user.name,
      authorVerified: user.emailVerified,
    })
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .where(eq(post.id, id))
    .limit(1);
  const r = rows[0];
  if (!r) return null;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(comment)
    .where(eq(comment.postId, id));

  return {
    id: r.id,
    author: r.authorName,
    authorVerified: r.authorVerified,
    category: r.category,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    likeCount: r.likeCount,
    replyCount: count,
  };
}

async function listComments(postId: string): Promise<CommentOut[]> {
  const rows = await db
    .select({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      authorName: user.name,
      authorVerified: user.emailVerified,
    })
    .from(comment)
    .innerJoin(user, eq(comment.authorId, user.id))
    .where(eq(comment.postId, postId))
    .orderBy(comment.createdAt);

  return rows.map((r) => ({
    id: r.id,
    author: r.authorName,
    authorVerified: r.authorVerified,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
  }));
}

// Returns true if this request was for a /api/posts* route (handled or
// rejected here) — server.ts falls through to Better Auth's handler
// otherwise.
export async function handlePostsRoute(req: IncomingMessage, res: ServerResponse, url: URL): Promise<boolean> {
  if (!url.pathname.startsWith("/api/posts")) return false;

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return true;
  }

  const commentsMatch = url.pathname.match(/^\/api\/posts\/([^/]+)\/comments$/);
  const singleMatch = url.pathname.match(/^\/api\/posts\/([^/]+)$/);

  try {
    if (url.pathname === "/api/posts" && req.method === "GET") {
      return json(res, 200, { posts: await listPosts() });
    }

    if (url.pathname === "/api/posts" && req.method === "POST") {
      const userId = await requireUserId(req);
      if (!userId) return json(res, 401, { message: "Unauthorized" });

      const body = (await readJsonBody(req)) as { category?: string; body?: string };
      if (!body.category || !body.body?.trim()) {
        return json(res, 422, { message: "category and body are required" });
      }

      const id = crypto.randomUUID();
      await db.insert(post).values({ id, authorId: userId, category: body.category, body: body.body.trim() });
      return json(res, 201, { post: await getPost(id) });
    }

    if (singleMatch && req.method === "GET") {
      const found = await getPost(singleMatch[1]);
      if (!found) return json(res, 404, { message: "Post not found" });
      return json(res, 200, { post: found });
    }

    if (commentsMatch && req.method === "GET") {
      const found = await getPost(commentsMatch[1]);
      if (!found) return json(res, 404, { message: "Post not found" });
      return json(res, 200, { comments: await listComments(commentsMatch[1]) });
    }

    if (commentsMatch && req.method === "POST") {
      const userId = await requireUserId(req);
      if (!userId) return json(res, 401, { message: "Unauthorized" });

      const found = await getPost(commentsMatch[1]);
      if (!found) return json(res, 404, { message: "Post not found" });

      const body = (await readJsonBody(req)) as { body?: string };
      if (!body.body?.trim()) return json(res, 422, { message: "body is required" });

      const id = crypto.randomUUID();
      await db.insert(comment).values({ id, postId: commentsMatch[1], authorId: userId, body: body.body.trim() });
      const [created] = await listComments(commentsMatch[1]).then((all) => all.filter((c) => c.id === id));
      return json(res, 201, { comment: created });
    }
  } catch (err) {
    console.error("posts route error:", err);
    return json(res, 500, { message: "Internal error" });
  }

  return json(res, 404, { message: "Not found" });
}
