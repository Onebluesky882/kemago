import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { BackButton } from "../../components/ui/BackButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { type BlockedUser, listBlocked, unblockUser } from "../../lib/api/blocksApi";
import { formatRelativeTime } from "../../lib/time";
import { useAuthStore } from "../../store/useAuthStore";

function BlockedUserRow({ user, onUnblock }: { user: BlockedUser; onUnblock: (id: string) => void }) {
  const [unblocking, setUnblocking] = useState(false);

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-border">
      <View className="flex-1 pr-3">
        <Text className="text-sm font-semibold text-text">{user.name}</Text>
        <Text className="text-xs text-text-muted mt-0.5">Blocked {formatRelativeTime(user.blockedAt)}</Text>
      </View>
      <Pressable
        disabled={unblocking}
        onPress={async () => {
          setUnblocking(true);
          await onUnblock(user.id);
        }}
        className="rounded-full px-3.5 py-1.5 border border-border"
      >
        <Text className="text-xs font-semibold text-text">{unblocking ? "Unblocking…" : "Unblock"}</Text>
      </Pressable>
    </View>
  );
}

export function BlockedUsersScreen() {
  const token = useAuthStore((s) => s.token);

  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      const result = await listBlocked(token);
      setBlocked(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUnblock = useCallback(
    async (userId: string) => {
      if (!token) return;
      try {
        await unblockUser(token, userId);
        setBlocked((prev) => prev.filter((u) => u.id !== userId));
      } catch {
        // best-effort — row stays put and the user can retry the tap
      }
    },
    [token],
  );

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center px-4 pt-3 pb-2 bg-surface border-b border-border">
        <BackButton />
        <Text className="text-lg font-bold text-text ml-3">Blocked users</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : error ? (
        <EmptyState title="Couldn't load blocked users" body="Check your connection and try again." />
      ) : (
        <FlatList
          data={blocked}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 pt-2 pb-8"
          renderItem={({ item }) => <BlockedUserRow user={item} onUnblock={handleUnblock} />}
          ListEmptyComponent={
            <EmptyState title="No blocked users" body="Anyone you block will show up here so you can unblock them later." />
          }
        />
      )}
    </View>
  );
}
