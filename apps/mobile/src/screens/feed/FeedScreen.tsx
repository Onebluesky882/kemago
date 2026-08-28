import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { CategoryChip } from "../../components/feed/CategoryChip";
import { ComposeBar } from "../../components/feed/ComposeBar";
import { PostCard } from "../../components/feed/PostCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { getAllPosts, initPostsStore, insertPost } from "../../lib/db/postsRepo";
import { currentUser, posts as seedPosts, type Post } from "../../lib/mockData";
import { useFeedFilterStore, type FeedFilter } from "../../store/useFeedFilterStore";

const filters: FeedFilter[] = ["All", "General", "Recommendations", "Lost & Found", "Safety"];

export function FeedScreen() {
  const { filter, setFilter } = useFeedFilterStore();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initPostsStore(seedPosts);
      const stored = await getAllPosts();
      if (!cancelled) setPosts(stored);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visiblePosts = useMemo(
    () => (filter === "All" ? posts : posts.filter((p) => p.category === filter)),
    [posts, filter],
  );

  const handlePost = useCallback(
    async (body: string) => {
      const newPost: Post = {
        id: `p_${Date.now()}`,
        author: currentUser.name,
        authorVerified: currentUser.verified,
        neighborhood: currentUser.neighborhood,
        category: filter === "All" ? "General" : filter,
        body,
        postedAt: "Just now",
        likeCount: 0,
        replyCount: 0,
      };
      await insertPost(newPost);
      setPosts((prev) => [newPost, ...prev]);
    },
    [filter],
  );

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
