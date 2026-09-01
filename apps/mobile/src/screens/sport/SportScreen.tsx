import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SportCard } from "../../components/sport/SportCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { sportActivities } from "../../lib/mockData";

export function SportScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="px-4 pt-3 pb-2 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text">Sport</Text>
      </View>

      <FlatList
        data={sportActivities}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pt-4 pb-8"
        renderItem={({ item }) => <SportCard activity={item} />}
        ListEmptyComponent={
          <EmptyState title="No activities yet" body="Pickup games and sport meetups near you will show up here." />
        }
      />
    </SafeAreaView>
  );
}
