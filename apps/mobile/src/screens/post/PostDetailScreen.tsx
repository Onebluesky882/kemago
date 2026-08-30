import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { BackButton } from "../../components/ui/BackButton";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { VerifiedBadge } from "../../components/ui/VerifiedBadge";
import { CommentComposer } from "../../components/feed/CommentComposer";
import { PollCard } from "../../components/feed/PollCard";
import { type ApiComment, type ApiPost, createComment, getPost, listComments } from "../../lib/api/postsApi";
import { formatRelativeTime } from "../../lib/time";
import { useAuthStore } from "../../store/useAuthStore";

function CommentRow({ comment }: { comment: ApiComment }) {
  return (
    <View className="py-3 border-b border-border">
      <View className="flex-row items-center gap-1 mb-1">
        <Text className="text-sm font-semibold text-text">{comment.author}</Text>
        {comment.authorVerified ? <VerifiedBadge size={11} /> : null}
        <Text className="text-xs text-text-muted ml-1">{formatRelativeTime(comment.createdAt)}</Text>
      </View>
      <Text className="text-sm text-text leading-relaxed">{comment.body}</Text>
    </View>
  );
}

export function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const token = useAuthStore((s) => s.token);

  const [post, setPost] = useState<ApiPost | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const [foundPost, foundComments] = await Promise.all([getPost(id), listComments(id)]);
      setPost(foundPost);
      setComments(foundComments);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleComment = useCallback(
    async (body: string) => {
      if (!id || !token) return;
      const created = await createComment(token, id, body);
      setComments((prev) => [...prev, created]);
    },
    [id, token],
  );

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center px-4 pt-3 pb-2 bg-surface border-b border-border">
        <BackButton />
        <Text className="text-lg font-bold text-text ml-3">Post</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : error || !post ? (
        <EmptyState title="Couldn't load this post" body="Check your connection and try again." />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 pt-4 pb-8"
          renderItem={({ item }) => <CommentRow comment={item} />}
          ListHeaderComponent={
            <View>
              <Card className="mb-4">
                <View className="flex-row items-center gap-1 mb-2">
                  <Text className="text-sm font-semibold text-text">{post.author}</Text>
                  {post.authorVerified ? <VerifiedBadge size={12} /> : null}
                  <Text className="text-xs text-text-muted ml-1">{formatRelativeTime(post.createdAt)}</Text>
                </View>
                <Text className="text-sm text-text leading-relaxed mb-3">{post.body}</Text>
                <Text className="text-xs text-text-muted">
                  {post.likeCount} likes · {post.replyCount} replies
                </Text>
              </Card>
              {post.hasPoll ? <PollCard postId={post.id} /> : null}
            </View>
          }
          ListEmptyComponent={<EmptyState title="No replies yet" body="Be the first to reply." />}
          ListFooterComponent={token ? <CommentComposer onSubmit={handleComment} /> : null}
        />
      )}
    </View>
  );
}
