import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { ApiRoom } from "../../lib/api/roomsApi";

type RoomCardProps = {
  room: ApiRoom;
  onToggleMembership: (room: ApiRoom) => void;
  busy?: boolean;
};

export function RoomCard({ room, onToggleMembership, busy }: RoomCardProps) {
  const router = useRouter();

  return (
    <Card className="mb-3" onPress={() => router.push(`/room/${room.id}/members`)}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-semibold text-text">{room.name}</Text>
        {room.joined ? <Badge label="Joined" tone="brand" /> : null}
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-text-muted">{room.memberCount} members</Text>
        <Pressable
          disabled={busy}
          onPress={(e) => {
            e.stopPropagation();
            onToggleMembership(room);
          }}
          className={`rounded-full px-3 py-1.5 ${room.joined ? "bg-border" : "bg-brand"}`}
        >
          <Text className={`text-xs font-semibold ${room.joined ? "text-text-muted" : "text-white"}`}>
            {room.joined ? "Leave" : "Join"}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
