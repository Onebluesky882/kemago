import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { CategoryChip } from "../../components/feed/CategoryChip";
import { ComposeBar } from "../../components/feed/ComposeBar";
import { PostCard } from "../../components/feed/PostCard";
import { RoomChip } from "../../components/feed/RoomChip";
import { StoriesBar } from "../../components/feed/StoriesBar";
import { StoryViewer } from "../../components/feed/StoryViewer";
import { EmptyState } from "../../components/ui/EmptyState";
import { type ApiPost, createPost as apiCreatePost, listPosts as apiListPosts } from "../../lib/api/postsApi";
import { type ApiRoom, listRooms as apiListRooms } from "../../lib/api/roomsApi";
import { type ApiStory, listStories as apiListStories } from "../../lib/api/storiesApi";
import { getAllPosts, initPostsStore, insertPost } from "../../lib/db/postsRepo";
import { currentUser, posts as seedPosts, type Post } from "../../lib/mockData";
import { useFeedRealtime } from "../../lib/realtime";
import { formatRelativeTime } from "../../lib/time";
import { useAuthStore } from "../../store/useAuthStore";
import { useFeedFilterStore, type FeedFilter } from "../../store/useFeedFilterStore";

const filters: FeedFilter[] = ["All", "General", "Recommendations", "Lost & Found", "Safety"];

// No neighborhood/location model exists on the backend yet (see
// coarea_product_rules memory) — real posts don't carry one, so this is a
// placeholder until that feature exists.
function toLocalPost(apiPost: ApiPost): Post {
  return {
    id: apiPost.id,
    authorId: apiPost.authorId,
    author: apiPost.author,
    authorVerified: apiPost.authorVerified,
    neighborhood: "Nearby",
    category: apiPost.category,
    body: apiPost.body,
    postedAt: formatRelativeTime(apiPost.createdAt),
    likeCount: apiPost.likeCount,
    replyCount: apiPost.replyCount,
  };
}

export function FeedScreen() {
  const { filter, setFilter } = useFeedFilterStore();
  const [posts, setPosts] = useState<Post[]>([]);
  // null = post to the default "general" room (backend auto-creates it on
  // first use) — not fetched as a real room until someone has posted once.
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [stories, setStories] = useState<ApiStory[]>([]);
  const [viewingStory, setViewingStory] = useState<ApiStory | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initPostsStore(seedPosts);
      try {
        const apiPosts = await apiListPosts();
        if (!cancelled) setPosts(apiPosts.map(toLocalPost));
      } catch {
        // Backend unreachable (offline, or not running) — fall back to the
        // local-first cache so the feed still shows something.
        const stored = await getAllPosts();
        if (!cancelled) setPosts(stored);
      }
      try {
        const token = useAuthStore.getState().token ?? undefined;
        const apiRooms = await apiListRooms(token);
        if (!cancelled) setRooms(apiRooms);
      } catch {
        // Room picker just falls back to "General" only — not critical to
        // the feed itself, so no offline fallback needed here.
      }
      try {
        const apiStories = await apiListStories();
        if (!cancelled) setStories(apiStories);
      } catch {
        // Stories bar just doesn't render if this fails — see StoriesBar's
        // own empty-state handling. Also silently empty if R2 isn't
        // configured on the backend (GET /api/stories 404s in that case).
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Live updates from other people's activity — this device's own writes
  // already update `posts` directly (see handlePost/PostCard's like
  // button), so post_created de-dupes by id and the count events just
  // overwrite whatever's there, which is a no-op for the actor's own device.
  useFeedRealtime(
    useCallback((event) => {
      if (event.type === "post_created") {
        setPosts((prev) => (prev.some((p) => p.id === event.post.id) ? prev : [toLocalPost(event.post), ...prev]));
        return;
      }
      if (event.type === "comment_created") {
        setPosts((prev) =>
          prev.map((p) => (p.id === event.postId ? { ...p, replyCount: p.replyCount + 1 } : p)),
        );
        return;
      }
      if (event.type === "like_changed") {
        setPosts((prev) =>
          prev.map((p) => (p.id === event.postId ? { ...p, likeCount: event.likeCount } : p)),
        );
      }
    }, []),
  );

  const visiblePosts = useMemo(
    () => (filter === "All" ? posts : posts.filter((p) => p.category === filter)),
    [posts, filter],
  );

  const handlePost = useCallback(
    async (body: string) => {
      const category = filter === "All" ? "General" : filter;
      const token = useAuthStore.getState().token;

      if (token) {
        try {
          const created = await apiCreatePost(token, {
            roomId: selectedRoomId ?? undefined,
            category,
            body,
          });
          const localPost = toLocalPost(created);
          await insertPost(localPost);
          setPosts((prev) => [localPost, ...prev]);
          return;
        } catch {
          // Fall through to the offline-only path below.
        }
      }

      const newPost: Post = {
        id: `p_${Date.now()}`,
        authorId: currentUser.id,
        author: currentUser.name,
        authorVerified: currentUser.verified,
        neighborhood: currentUser.neighborhood,
        category,
        body,
        postedAt: "Just now",
        likeCount: 0,
        replyCount: 0,
      };
      await insertPost(newPost);
      setPosts((prev) => [newPost, ...prev]);
    },
    [filter, selectedRoomId],
  );

  return (
    <View className="flex-1 bg-bg">
      <View className="px-4 pt-3 pb-2 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text">Elm Street</Text>
      </View>

      <StoriesBar
        stories={stories}
        onOpenStory={setViewingStory}
        onUploaded={(story) => setStories((prev) => [story, ...prev])}
      />

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
        ListHeaderComponent={
          <View>
            {rooms.length > 0 ? (
              <View>
                <Text className="text-xs font-semibold text-text-muted uppercase mb-2">Posting to</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                  <RoomChip label="General" active={selectedRoomId === null} onPress={() => setSelectedRoomId(null)} />
                  {rooms.map((room) => (
                    <RoomChip
                      key={room.id}
                      label={room.name}
                      active={selectedRoomId === room.id}
                      onPress={() => setSelectedRoomId(room.id)}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}
            <ComposeBar onPost={handlePost} />
          </View>
        }
        renderItem={({ item }) => <PostCard post={item} />}
        ListEmptyComponent={
          <EmptyState title="No posts yet" body="Be the first to share something in this category." />
        }
      />

      {viewingStory ? <StoryViewer story={viewingStory} onClose={() => setViewingStory(null)} /> : null}
    </View>
  );
}
