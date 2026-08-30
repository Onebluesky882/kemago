import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { BackButton } from "../../components/ui/BackButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { RoomCard } from "../../components/rooms/RoomCard";
import {
  type ApiRoom,
  createRoom as apiCreateRoom,
  joinRoom as apiJoinRoom,
  leaveRoom as apiLeaveRoom,
  listRooms as apiListRooms,
} from "../../lib/api/roomsApi";
import { colors } from "../../theme/colors";
import { useAuthStore } from "../../store/useAuthStore";

export function RoomsScreen() {
  const token = useAuthStore((s) => s.token);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const apiRooms = await apiListRooms(token ?? undefined);
      setRooms(apiRooms);
      setError(false);
    } catch {
      setError(true);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleMembership = useCallback(
    async (room: ApiRoom) => {
      if (!token || busyId) return;
      setBusyId(room.id);
      try {
        if (room.joined) {
          await apiLeaveRoom(token, room.id);
          setRooms((prev) =>
            prev.map((r) =>
              r.id === room.id ? { ...r, joined: false, memberCount: Math.max(0, r.memberCount - 1) } : r,
            ),
          );
        } else {
          await apiJoinRoom(token, room.id);
          setRooms((prev) =>
            prev.map((r) => (r.id === room.id ? { ...r, joined: true, memberCount: r.memberCount + 1 } : r)),
          );
        }
      } catch {
        // No toast/alert pattern exists elsewhere in this app yet — row
        // just stays as-is and the user can retry the tap.
      } finally {
        setBusyId(null);
      }
    },
    [token, busyId],
  );

  const handleCreateRoom = useCallback(async () => {
    const name = newRoomName.trim();
    if (!token || !name || creating) return;
    setCreating(true);
    try {
      const created = await apiCreateRoom(token, name);
      setRooms((prev) => [created, ...prev]);
      setNewRoomName("");
    } catch {
      // Input stays filled in so the user can retry.
    } finally {
      setCreating(false);
    }
  }, [token, newRoomName, creating]);

  const canCreate = newRoomName.trim().length > 0 && !creating;

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center px-4 pt-3 pb-2 bg-surface border-b border-border">
        <BackButton />
        <Text className="text-lg font-bold text-text ml-3">Rooms</Text>
      </View>

      {error ? (
        <EmptyState title="Couldn't load rooms" body="Check your connection and try again." />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 pt-4 pb-8"
          ListHeaderComponent={
            token ? (
              <View className="flex-row items-end bg-surface border border-border rounded-lg px-3 py-2 mb-4">
                <TextInput
                  value={newRoomName}
                  onChangeText={setNewRoomName}
                  placeholder="Start a new room…"
                  placeholderTextColor={colors.textMuted}
                  className="flex-1 text-sm text-text py-1.5"
                />
                <Pressable
                  disabled={!canCreate}
                  onPress={handleCreateRoom}
                  className={`ml-2 rounded-full px-3.5 py-1.5 ${canCreate ? "bg-brand" : "bg-border"}`}
                >
                  <Text className={`text-xs font-semibold ${canCreate ? "text-white" : "text-text-muted"}`}>
                    Create
                  </Text>
                </Pressable>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <RoomCard room={item} onToggleMembership={handleToggleMembership} busy={busyId === item.id} />
          )}
          ListEmptyComponent={<EmptyState title="No rooms yet" body="Rooms people create will show up here." />}
        />
      )}
    </View>
  );
}
