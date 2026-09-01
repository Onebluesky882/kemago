import type { ApiNotification } from "../../lib/api/notificationsApi";

// Pure logic pulled out of NotificationsScreen so it's testable without a
// React Native rendering environment (this file has no RN imports).

export function messageFor(n: ApiNotification): string {
  switch (n.kind) {
    case "friend_request":
      return `${n.actorName} sent you a friend request`;
    case "friend_accepted":
      return `${n.actorName} accepted your friend request`;
    case "comment":
      return `${n.actorName} commented on your post`;
    case "like":
      return `${n.actorName} liked your post`;
    default:
      // Defensive fallback: the backend's notification kind is an
      // unconstrained string, so a future kind added there without a
      // matching mobile release should still render something instead of
      // a blank line.
      return "You have a new notification";
  }
}

// Marks `id` read in `notifications` without mutating the input, and
// reports whether it was already read. Used from a React state updater
// (see handlePress in NotificationsScreen) so the "already read?" check
// runs against the latest state at update time rather than a stale `n`
// closed over from render — otherwise two rapid taps on the same row,
// racing ahead of a re-render, would both see read === false and
// double-decrement a shared unread counter.
export function markLocalRead(
  notifications: ApiNotification[],
  id: string,
): { notifications: ApiNotification[]; alreadyRead: boolean } {
  let alreadyRead = true;
  const next = notifications.map((n) => {
    if (n.id !== id) return n;
    alreadyRead = n.read;
    return { ...n, read: true };
  });
  return { notifications: next, alreadyRead };
}
