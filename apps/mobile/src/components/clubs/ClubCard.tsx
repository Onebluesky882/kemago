import { Text, View } from "react-native";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { Club } from "../../lib/mockData";

export function ClubCard({ club }: { club: Club }) {
  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Badge label={club.category} tone="neutral" />
        {club.joined ? <Badge label="Joined" tone="brand" /> : null}
      </View>

      <Text className="text-base font-semibold text-text mb-1">{club.name}</Text>
      <Text className="text-sm text-text-muted leading-relaxed mb-2">{club.description}</Text>
      <Text className="text-xs text-text-muted">{club.memberCount} members</Text>
    </Card>
  );
}
