import { Pressable, Text, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import type { ApiConversation } from "../../lib/api/chatApi";
import { formatRelativeTime } from "../../lib/time";

export function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: ApiConversation;
  onPress: (conversation: ApiConversation) => void;
}) {
  const title = conversation.type === "dm" ? (conversation.otherUser?.name ?? "Unknown") : conversation.name;

  return (
    <Pressable
      onPress={() => onPress(conversation)}
      className="flex-row items-center px-4 py-3 border-b border-border active:bg-bg"
    >
      <Avatar initials={initialsOf(title)} />
      <View className="ml-3 flex-1">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-sm font-semibold text-text" numberOfLines={1}>
            {title}
          </Text>
          {conversation.lastMessageAt ? (
            <Text className="text-xs text-text-muted">{formatRelativeTime(conversation.lastMessageAt)}</Text>
          ) : null}
        </View>
        <Text numberOfLines={1} className="text-sm text-text-muted">
          {conversation.lastMessage ?? (conversation.type === "group" ? `${conversation.memberCount} members` : "No messages yet")}
        </Text>
      </View>
    </Pressable>
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
