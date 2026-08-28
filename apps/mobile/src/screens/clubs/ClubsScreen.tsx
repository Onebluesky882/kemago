import { FlatList, Text, View } from "react-native";
import { ClubCard } from "../../components/clubs/ClubCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { clubs } from "../../lib/mockData";

export function ClubsScreen() {
  return (
    <View className="flex-1 bg-bg">
      <View className="px-4 pt-3 pb-2 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text">My Clubs</Text>
      </View>

      <FlatList
        data={clubs}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pt-4 pb-8"
        renderItem={({ item }) => <ClubCard club={item} />}
        ListEmptyComponent={
          <EmptyState title="No clubs yet" body="Clubs you join in the neighborhood will show up here." />
        }
      />
    </View>
  );
}
