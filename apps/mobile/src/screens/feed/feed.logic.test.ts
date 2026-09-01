import { describe, expect, it } from "vitest";
import type { Post } from "../../lib/mockData";
import { addPostIfNew } from "./feed.logic";

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: "post_1",
    authorId: "u1",
    author: "Alex",
    authorVerified: false,
    neighborhood: "Nearby",
    category: "General",
    body: "Hello",
    postedAt: "Just now",
    likeCount: 0,
    replyCount: 0,
    ...overrides,
  };
}

describe("addPostIfNew", () => {
  it("prepends a post not already in the list", () => {
    const existing = [post({ id: "post_0" })];
    const result = addPostIfNew(existing, post({ id: "post_1" }));
    expect(result.map((p) => p.id)).toEqual(["post_1", "post_0"]);
  });

  // Regression test for the duplicate-key bug: the backend broadcasts a
  // new post over the websocket before its HTTP response is written, so
  // on the posting device the realtime handler can add the post first,
  // then handlePost's own success path would previously add it again.
  it("is a no-op when a post with the same id is already present", () => {
    const existing = [post({ id: "post_1", body: "Hello" })];
    const result = addPostIfNew(existing, post({ id: "post_1", body: "Hello" }));
    expect(result).toHaveLength(1);
    expect(result).toBe(existing);
  });

  it("simulates the websocket-then-HTTP race landing only one copy in the list", () => {
    let posts: Post[] = [];
    const created = post({ id: "post_race" });

    // websocket post_created arrives first
    posts = addPostIfNew(posts, created);
    // apiCreatePost's response resolves afterward with the same post
    posts = addPostIfNew(posts, created);

    expect(posts).toHaveLength(1);
  });
});
