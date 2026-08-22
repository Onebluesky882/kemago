import { Text, View } from "react-native";
import { Card } from "../ui/Card";
import type { LocalEvent } from "../../lib/mockData";

export function EventCard({ event }: { event: LocalEvent }) {
  return (
    <Card className="mb-3">
      <Text className="text-xs font-medium text-brand mb-1">{event.dateLabel}</Text>
      <Text className="text-base font-semibold text-text mb-1">{event.title}</Text>
      <Text className="text-sm text-text-muted mb-3">{event.location}</Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-text-muted">
          Hosted by {event.host} · {event.goingCount} going
        </Text>
      </View>
    </Card>
  );
}
