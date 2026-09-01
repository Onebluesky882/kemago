import { describe, expect, it } from "vitest";
import type { ApiNotification } from "../../lib/api/notificationsApi";
import { markLocalRead, messageFor } from "./notifications.logic";

function notif(overrides: Partial<ApiNotification> = {}): ApiNotification {
  return {
    id: "n1",
    kind: "like",
    actorId: "u1",
    actorName: "Alex",
    read: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("messageFor", () => {
  it("renders each known kind", () => {
    expect(messageFor(notif({ kind: "friend_request" }))).toBe("Alex sent you a friend request");
    expect(messageFor(notif({ kind: "friend_accepted" }))).toBe("Alex accepted your friend request");
    expect(messageFor(notif({ kind: "comment" }))).toBe("Alex commented on your post");
    expect(messageFor(notif({ kind: "like" }))).toBe("Alex liked your post");
  });

  it("falls back instead of rendering blank for an unrecognized kind", () => {
    const unknown = notif({ kind: "poked" as ApiNotification["kind"] });
    expect(messageFor(unknown)).toBe("You have a new notification");
  });
});

describe("markLocalRead", () => {
  it("marks the matching unread notification as read", () => {
    const list = [notif({ id: "a", read: false }), notif({ id: "b", read: false })];
    const result = markLocalRead(list, "a");
    expect(result.alreadyRead).toBe(false);
    expect(result.notifications.find((n) => n.id === "a")?.read).toBe(true);
    expect(result.notifications.find((n) => n.id === "b")?.read).toBe(false);
  });

  it("does not mutate the input array", () => {
    const list = [notif({ id: "a", read: false })];
    const result = markLocalRead(list, "a");
    expect(list[0].read).toBe(false);
    expect(result.notifications).not.toBe(list);
  });

  it("reports alreadyRead for a notification that is already read", () => {
    const list = [notif({ id: "a", read: true })];
    const result = markLocalRead(list, "a");
    expect(result.alreadyRead).toBe(true);
    expect(result.notifications[0].read).toBe(true);
  });

  it("regression: two rapid taps on the same row only decrement once", () => {
    // Simulates handlePress's setNotifications functional updater being
    // invoked twice back-to-back against the same starting list, the way
    // two taps racing ahead of a React re-render would — before the fix,
    // both calls read the stale `n.read === false` from render and both
    // decremented unreadCount.
    let list = [notif({ id: "a", read: false })];
    let decrements = 0;

    for (let tap = 0; tap < 2; tap++) {
      const result = markLocalRead(list, "a");
      list = result.notifications;
      if (!result.alreadyRead) decrements++;
    }

    expect(decrements).toBe(1);
    expect(list[0].read).toBe(true);
  });

  it("leaves the list unchanged for an unknown id", () => {
    const list = [notif({ id: "a", read: false })];
    const result = markLocalRead(list, "missing");
    expect(result.alreadyRead).toBe(true);
    expect(result.notifications).toEqual(list);
  });
});
