import { useEffect, useRef } from "react";
import { API_BASE_URL } from "./api/config";
import type { ApiComment, ApiPost } from "./api/postsApi";
import { useAuthStore } from "../store/useAuthStore";

// backend/api-go's websocket hub (internal/hub) pushes these as JSON text
// frames — see internal/feed/feed.go's broadcast/broadcastLikeChanged and
// internal/friends/friends.go's notify. Every connection joins exactly one
// channel: either the shared "feed:all" room (no auth — the Feed screen
// shows every room's posts mixed together, so events aren't per-room
// either) or a personal "user:<id>" room derived server-side from a
// verified Bearer token (never trusts a client-supplied user id).
export type FeedEvent =
  | { type: "post_created"; post: ApiPost }
  | { type: "comment_created"; postId: string; comment: ApiComment }
  | { type: "like_changed"; postId: string; likeCount: number }
  | { type: "poll_added"; postId: string };

export type FriendEvent =
  | { type: "friend_request"; from: { userId: string; name: string } }
  | { type: "friend_accepted"; by: { userId: string; name: string } };

function wsBase(): string {
  return API_BASE_URL.replace(/^http/, "ws");
}

// Shared low-level connector — opens a socket, parses each frame as JSON,
// reconnects on close/error after a short delay (a dropped wifi/backgrounded
// app shouldn't permanently end real-time updates for the session), and
// cleans up on unmount. `enabled` lets callers hold off connecting until
// they have what the URL needs (e.g. a token).
function useChannel<T>(url: string | null, onEvent: (event: T) => void) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!url) return;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closedByCleanup = false;

    function connect() {
      socket = new WebSocket(url as string);
      socket.onmessage = (e) => {
        try {
          onEventRef.current(JSON.parse(e.data as string) as T);
        } catch {
          // Malformed frame — ignore rather than crash the listener.
        }
      };
      socket.onclose = () => {
        if (closedByCleanup) return;
        reconnectTimer = setTimeout(connect, 3000);
      };
    }

    connect();
    return () => {
      closedByCleanup = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [url]);
}

// Feed events (new posts, comments, likes) — shared channel, no auth
// required to listen (matches GET /api/posts' own no-login-wall read path).
export function useFeedRealtime(onEvent: (event: FeedEvent) => void) {
  useChannel<FeedEvent>(`${wsBase()}/ws?room=feed:all`, onEvent);
}

// Personal events (friend requests/accepts) — requires a signed-in session;
// does nothing while signed out.
export function useFriendRealtime(onEvent: (event: FriendEvent) => void) {
  const token = useAuthStore((s) => s.token);
  useChannel<FriendEvent>(token ? `${wsBase()}/ws?token=${encodeURIComponent(token)}` : null, onEvent);
}
