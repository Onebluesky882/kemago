import { FlatList, Text, View } from "react-native";
import { EventCard } from "../../components/events/EventCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { events } from "../../lib/mockData";

export function EventsScreen() {
  return (
    <View className="flex-1 bg-bg">
      <View className="px-4 pt-3 pb-2 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text">Events</Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pt-4 pb-8"
        renderItem={({ item }) => <EventCard event={item} />}
        ListEmptyComponent={
          <EmptyState title="No events yet" body="Upcoming neighborhood events will show up here." />
        }
      />
    </View>
  );
}
