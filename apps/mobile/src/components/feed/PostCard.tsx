import { Text, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import type { Post } from "../../lib/mockData";

const categoryTone: Record<Post["category"], "brand" | "accent" | "neutral"> = {
  General: "neutral",
  Recommendations: "brand",
  "Lost & Found": "accent",
  Safety: "accent",
};

export function PostCard({ post }: { post: Post }) {
  return (
    <Card className="mb-3">
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

      <View className="flex-row items-center gap-4">
        <Text className="text-xs text-text-muted">{post.likeCount} likes</Text>
        <Text className="text-xs text-text-muted">{post.replyCount} replies</Text>
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
