import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { BackButton } from "../../components/ui/BackButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { VerifiedBadge } from "../../components/ui/VerifiedBadge";
import {
  acceptFriendRequest,
  declineFriendRequest,
  type FriendEntry,
  listFriends,
  listIncomingRequests,
  removeFriend,
} from "../../lib/api/friendsApi";
import { useFriendRealtime } from "../../lib/realtime";
import { formatRelativeTime } from "../../lib/time";
import { useAuthStore } from "../../store/useAuthStore";

function PersonRow({
  person,
  actions,
}: {
  person: FriendEntry;
  actions: { label: string; onPress: () => void; muted?: boolean }[];
}) {
  const [busy, setBusy] = useState(false);

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-border">
      <View className="flex-1 pr-3">
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-semibold text-text">{person.name}</Text>
          {person.verified ? <VerifiedBadge size={11} /> : null}
        </View>
        <Text className="text-xs text-text-muted mt-0.5">{formatRelativeTime(person.createdAt)}</Text>
      </View>
      <View className="flex-row gap-2">
        {actions.map((action) => (
          <Pressable
            key={action.label}
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              await action.onPress();
            }}
            className={`rounded-full px-3.5 py-1.5 border ${action.muted ? "border-border" : "border-brand"}`}
          >
            <Text className={`text-xs font-semibold ${action.muted ? "text-text" : "text-brand"}`}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function FriendsScreen() {
  const token = useAuthStore((s) => s.token);

  const [requests, setRequests] = useState<FriendEntry[]>([]);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      const [incoming, current] = await Promise.all([listIncomingRequests(token), listFriends(token)]);
      setRequests(incoming);
      setFriends(current);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  // A new request coming in, or someone accepting one this device sent,
  // both change what both lists should show — simplest correct response
  // is just refetching rather than hand-merging the event into state.
  useFriendRealtime(useCallback(() => load(), [load]));

  const handleAccept = useCallback(
    async (userId: string) => {
      if (!token) return;
      try {
        await acceptFriendRequest(token, userId);
        const accepted = requests.find((r) => r.userId === userId);
        setRequests((prev) => prev.filter((r) => r.userId !== userId));
        if (accepted) setFriends((prev) => [accepted, ...prev]);
      } catch {
        // best-effort — row stays put and the user can retry the tap
      }
    },
    [token, requests],
  );

  const handleDecline = useCallback(
    async (userId: string) => {
      if (!token) return;
      try {
        await declineFriendRequest(token, userId);
        setRequests((prev) => prev.filter((r) => r.userId !== userId));
      } catch {
        // best-effort
      }
    },
    [token],
  );

  const handleRemove = useCallback(
    async (userId: string) => {
      if (!token) return;
      try {
        await removeFriend(token, userId);
        setFriends((prev) => prev.filter((f) => f.userId !== userId));
      } catch {
        // best-effort
      }
    },
    [token],
  );

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center px-4 pt-3 pb-2 bg-surface border-b border-border">
        <BackButton />
        <Text className="text-lg font-bold text-text ml-3">Friends</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : error ? (
        <EmptyState title="Couldn't load friends" body="Check your connection and try again." />
      ) : (
        <ScrollView contentContainerClassName="px-4 pt-2 pb-8">
          {requests.length > 0 ? (
            <View className="mb-6">
              <Text className="text-xs font-semibold text-text-muted uppercase mb-1">Requests</Text>
              {requests.map((person) => (
                <PersonRow
                  key={person.userId}
                  person={person}
                  actions={[
                    { label: "Accept", onPress: () => handleAccept(person.userId) },
                    { label: "Decline", onPress: () => handleDecline(person.userId), muted: true },
                  ]}
                />
              ))}
            </View>
          ) : null}

          <Text className="text-xs font-semibold text-text-muted uppercase mb-1">Friends</Text>
          {friends.length === 0 ? (
            <EmptyState title="No friends yet" body="People you connect with will show up here." />
          ) : (
            friends.map((person) => (
              <PersonRow
                key={person.userId}
                person={person}
                actions={[{ label: "Remove", onPress: () => handleRemove(person.userId), muted: true }]}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
