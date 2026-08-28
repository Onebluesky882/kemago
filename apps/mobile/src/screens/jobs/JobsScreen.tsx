import { FlatList, Text, View } from "react-native";
import { JobCard } from "../../components/jobs/JobCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { jobPosts } from "../../lib/mockData";

export function JobsScreen() {
  return (
    <View className="flex-1 bg-bg">
      <View className="px-4 pt-3 pb-2 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text">Jobs & Announcements</Text>
      </View>

      <FlatList
        data={jobPosts}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pt-4 pb-8"
        renderItem={({ item }) => <JobCard job={item} />}
        ListEmptyComponent={
          <EmptyState title="Nothing posted yet" body="Job listings and neighborhood announcements will show up here." />
        }
      />
    </View>
  );
}
