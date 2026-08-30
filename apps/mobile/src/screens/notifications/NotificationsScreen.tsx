import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { BackButton } from "../../components/ui/BackButton";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  type ApiNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../lib/api/notificationsApi";
import { formatRelativeTime } from "../../lib/time";
import { useAuthStore } from "../../store/useAuthStore";

function messageFor(n: ApiNotification): string {
  switch (n.kind) {
    case "friend_request":
      return `${n.actorName} sent you a friend request`;
    case "friend_accepted":
      return `${n.actorName} accepted your friend request`;
    case "comment":
      return `${n.actorName} commented on your post`;
    case "like":
      return `${n.actorName} liked your post`;
  }
}

function NotificationRow({ notification, onPress }: { notification: ApiNotification; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-start justify-between px-4 py-3 border-b border-border ${
        notification.read ? "" : "bg-brand-soft"
      }`}
    >
      <View className="flex-1 pr-3">
        <Text className="text-sm text-text">{messageFor(notification)}</Text>
        <Text className="text-xs text-text-muted mt-0.5">{formatRelativeTime(notification.createdAt)}</Text>
      </View>
      {!notification.read ? <View className="w-2 h-2 rounded-full bg-brand mt-1.5" /> : null}
    </Pressable>
  );
}

export function NotificationsScreen() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await listNotifications(token);
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // Backend unreachable — leave whatever was already showing.
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePress = useCallback(
    async (n: ApiNotification) => {
      if (!token || n.read) return;
      // Optimistic — a failed mark-read just means it stays bold until the
      // next load, no need to block the tap on the round trip.
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markNotificationRead(token, n.id);
      } catch {
        // best-effort, see above
      }
    },
    [token],
  );

  const handleMarkAllRead = useCallback(async () => {
    if (!token || unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead(token);
    } catch {
      // best-effort, see above
    }
  }, [token, unreadCount]);

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2 bg-surface border-b border-border">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text className="text-xl font-bold text-text">Notifications</Text>
        </View>
        {unreadCount > 0 ? (
          <Pressable onPress={handleMarkAllRead} hitSlop={8}>
            <Text className="text-xs font-semibold text-brand">Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationRow notification={item} onPress={() => handlePress(item)} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState title="No notifications yet" body="Friend requests, comments, and likes will show up here." />
          ) : null
        }
      />
    </View>
  );
}
