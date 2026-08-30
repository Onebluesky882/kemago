import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { listNotifications } from "../../lib/api/notificationsApi";
import { useFriendRealtime } from "../../lib/realtime";
import { useAuthStore } from "../../store/useAuthStore";
import { colors } from "../../theme/colors";

// Comment/like notifications only arrive via GET /api/notifications
// (feed:all's realtime events aren't scoped per-recipient, unlike friend
// events) — so the badge count is fetched on mount/sign-in and nudged by
// useFriendRealtime for the two event types that do have a personal
// channel. Not live-live for every kind, but close enough without adding
// new server-side event scoping for this pass.
export function NotificationBell() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    let cancelled = false;
    listNotifications(token)
      .then((res) => {
        if (!cancelled) setUnreadCount(res.unreadCount);
      })
      .catch(() => {
        // Backend unreachable — leave the last known count rather than
        // resetting to 0, same spirit as the Feed's offline fallback.
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useFriendRealtime(() => {
    if (!token) return;
    listNotifications(token)
      .then((res) => setUnreadCount(res.unreadCount))
      .catch(() => {});
  });

  if (!token) return null;

  return (
    <Pressable onPress={() => router.push("/notifications")} hitSlop={10} className="p-1">
      <View>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" />
          <Path d="M10 19a2 2 0 0 0 4 0" />
        </Svg>
        {unreadCount > 0 ? (
          <View className="absolute -top-1 -right-1 bg-accent rounded-full min-w-[16px] h-4 items-center justify-center px-1">
            <Text className="text-[10px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
