import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AddFriendButton } from "../ui/AddFriendButton";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { BlockUserButton } from "../ui/BlockUserButton";
import { Card } from "../ui/Card";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import { PollCard } from "./PollCard";
import { PollComposer } from "./PollComposer";
import { createPoll } from "../../lib/api/pollsApi";
import type { Post } from "../../lib/mockData";
import { useAuthStore } from "../../store/useAuthStore";

const categoryTone: Record<Post["category"], "brand" | "accent" | "neutral"> = {
  General: "neutral",
  Recommendations: "brand",
  "Lost & Found": "accent",
  Safety: "accent",
};

export function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.userId);
  const isOwnPost = userId != null && userId === post.authorId;

  const [composingPoll, setComposingPoll] = useState(false);
  // The realtime poll_added event (see lib/realtime.ts) flips post.hasPoll
  // via FeedScreen's state for every connected client, including this
  // device's own — but that's a network round-trip. This local flag shows
  // the poll immediately after a successful create instead of waiting on it.
  const [justCreatedPoll, setJustCreatedPoll] = useState(false);
  const hasPoll = post.hasPoll || justCreatedPoll;

  async function handleCreatePoll(input: { question: string; options: string[] }) {
    if (!token) return;
    await createPoll(token, post.id, input);
    setJustCreatedPoll(true);
    setComposingPoll(false);
  }

  return (
    <Card className="mb-3" onPress={() => router.push(`/post/${post.id}`)}>
      <View className="flex-row items-center mb-3">
        <Avatar initials={initialsOf(post.author)} />
        <View className="ml-3 flex-1">
          <View className="flex-row items-center gap-1">
            <Text className="text-sm font-semibold text-text">{post.author}</Text>
            {post.authorVerified ? <VerifiedBadge size={12} /> : null}
          </View>
          <Text className="text-xs text-text-muted">
            {post.neighborhood} · {post.postedAt}
          </Text>
        </View>
        <Badge label={post.category} tone={categoryTone[post.category]} />
      </View>

      <Text className="text-sm text-text leading-relaxed mb-3">{post.body}</Text>

      {hasPoll ? <PollCard postId={post.id} /> : null}
      {!hasPoll && composingPoll ? (
        <PollComposer onSubmit={handleCreatePoll} onCancel={() => setComposingPoll(false)} />
      ) : null}

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <Text className="text-xs text-text-muted">{post.likeCount} likes</Text>
          <Text className="text-xs text-text-muted">{post.replyCount} replies</Text>
          {!hasPoll && !composingPoll && token ? (
            <Pressable onPress={() => setComposingPoll(true)} hitSlop={8}>
              <Text className="text-xs font-semibold text-brand">+ Add poll</Text>
            </Pressable>
          ) : null}
        </View>
        {isOwnPost ? null : (
          <View className="flex-row items-center gap-3">
            <AddFriendButton userId={post.authorId} userName={post.author} />
            <BlockUserButton userId={post.authorId} userName={post.author} />
          </View>
        )}
      </View>
    </Card>
  );
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
