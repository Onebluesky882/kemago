import { Pressable, Text, View } from "react-native";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { ApiClub } from "../../lib/api/clubsApi";

type ClubCardProps = {
  club: ApiClub;
  onToggleMembership: (club: ApiClub) => void;
  busy?: boolean;
};

export function ClubCard({ club, onToggleMembership, busy }: ClubCardProps) {
  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Badge label={club.category || "Club"} tone="neutral" />
        {club.joined ? <Badge label="Joined" tone="brand" /> : null}
      </View>

      <Text className="text-base font-semibold text-text mb-1">{club.name}</Text>
      <Text className="text-sm text-text-muted leading-relaxed mb-2">{club.description}</Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-text-muted">
          {club.memberCount} members · led by {club.leaderName}
        </Text>
        <Pressable
          disabled={busy}
          onPress={() => onToggleMembership(club)}
          className={`rounded-full px-3 py-1.5 ${club.joined ? "bg-border" : "bg-brand"}`}
        >
          <Text className={`text-xs font-semibold ${club.joined ? "text-text-muted" : "text-white"}`}>
            {club.joined ? "Leave" : "Join"}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
