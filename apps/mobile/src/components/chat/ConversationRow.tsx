import { Pressable, Text, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import type { Conversation } from "../../lib/mockData";

export function ConversationRow({ conversation }: { conversation: Conversation }) {
  return (
    <Pressable className="flex-row items-center px-4 py-3 border-b border-border active:bg-bg">
      <Avatar initials={initialsOf(conversation.name)} />
      <View className="ml-3 flex-1">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-sm font-semibold text-text">{conversation.name}</Text>
          <Text className="text-xs text-text-muted">{conversation.timeLabel}</Text>
        </View>
        <Text
          numberOfLines={1}
          className={`text-sm ${conversation.unread ? "text-text font-medium" : "text-text-muted"}`}
        >
          {conversation.lastMessage}
        </Text>
      </View>
      {conversation.unread ? <View className="w-2 h-2 rounded-full bg-brand ml-2" /> : null}
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
