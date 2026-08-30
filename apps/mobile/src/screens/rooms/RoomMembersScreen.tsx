import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { BackButton } from "../../components/ui/BackButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { VerifiedBadge } from "../../components/ui/VerifiedBadge";
import { listRoomMembers, type RoomMember } from "../../lib/api/roomsApi";

function MemberRow({ member }: { member: RoomMember }) {
  return (
    <View className="flex-row items-center gap-1 py-3 border-b border-border">
      <Text className="text-sm font-semibold text-text">{member.name}</Text>
      {member.verified ? <VerifiedBadge size={11} /> : null}
    </View>
  );
}

export function RoomMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const result = await listRoomMembers(id);
      setMembers(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center px-4 pt-3 pb-2 bg-surface border-b border-border">
        <BackButton />
        <Text className="text-lg font-bold text-text ml-3">Members</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : error ? (
        <EmptyState title="Couldn't load members" body="Check your connection and try again." />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 pt-2 pb-8"
          renderItem={({ item }) => <MemberRow member={item} />}
          ListEmptyComponent={<EmptyState title="No members yet" body="Whoever joins this room will show up here." />}
        />
      )}
    </View>
  );
}
