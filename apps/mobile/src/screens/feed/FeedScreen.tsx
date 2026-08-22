import { useMemo, useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { CategoryChip } from "../../components/feed/CategoryChip";
import { ComposeBar } from "../../components/feed/ComposeBar";
import { PostCard } from "../../components/feed/PostCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { posts as mockPosts, type Post } from "../../lib/mockData";
import { useFeedFilterStore, type FeedFilter } from "../../store/useFeedFilterStore";

const filters: FeedFilter[] = ["All", "General", "Recommendations", "Lost & Found", "Safety"];

export function FeedScreen() {
  const { filter, setFilter } = useFeedFilterStore();
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const visiblePosts = useMemo(
    () => (filter === "All" ? posts : posts.filter((p) => p.category === filter)),
    [posts, filter],
  );

  function handlePost(body: string) {
    setPosts((prev) => [
      {
        id: `p_${Date.now()}`,
        author: "Jordan Lee",
        neighborhood: "Elm Street",
        category: "General",
        body,
        postedAt: "Just now",
        likeCount: 0,
        replyCount: 0,
      },
      ...prev,
    ]);
  }

  return (
    <View className="flex-1 bg-bg">
      <View className="px-4 pt-3 pb-2 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text">Elm Street</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3 bg-surface border-b border-border"
      >
        {filters.map((f) => (
          <CategoryChip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pt-4 pb-8"
        ListHeaderComponent={<ComposeBar onPost={handlePost} />}
        renderItem={({ item }) => <PostCard post={item} />}
        ListEmptyComponent={
          <EmptyState title="No posts yet" body="Be the first to share something in this category." />
        }
      />
    </View>
  );
}
