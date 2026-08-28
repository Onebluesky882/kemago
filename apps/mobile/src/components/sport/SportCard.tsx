import { Text, View } from "react-native";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import type { SportActivity } from "../../lib/mockData";

export function SportCard({ activity }: { activity: SportActivity }) {
  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Badge label={activity.sport} tone="brand" />
        <Text className="text-xs text-text-muted">{activity.spotsLeft} spots left</Text>
      </View>

      <Text className="text-base font-semibold text-text mb-1">{activity.title}</Text>
      <Text className="text-xs font-medium text-brand mb-1">{activity.dateLabel}</Text>
      <Text className="text-sm text-text-muted mb-2">{activity.location}</Text>

      <View className="flex-row items-center gap-1">
        <Text className="text-xs text-text-muted">Hosted by {activity.hostName}</Text>
        {activity.hostVerified ? <VerifiedBadge size={12} /> : null}
      </View>
    </Card>
  );
}
