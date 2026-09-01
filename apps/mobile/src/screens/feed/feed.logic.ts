import type { Post } from "../../lib/mockData";

// Pure logic pulled out of FeedScreen so it's testable without a React
// Native rendering environment (this file has no RN imports).

// Prepends `post` unless a post with the same id is already present.
// Needed because the backend broadcasts a new post over the websocket
// hub *before* writing its HTTP response (see createPost in
// internal/feed) — on the posting device itself, the websocket
// post_created event can arrive before the REST call's promise resolves.
// Without this dedup, adding the post from both paths would leave two
// list items with the same id/key.
export function addPostIfNew(posts: Post[], post: Post): Post[] {
  return posts.some((p) => p.id === post.id) ? posts : [post, ...posts];
}
