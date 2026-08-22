import { FlatList, Text, View } from "react-native";
import { ConversationRow } from "../../components/chat/ConversationRow";
import { EmptyState } from "../../components/ui/EmptyState";
import { conversations } from "../../lib/mockData";

export function ChatScreen() {
  return (
    <View className="flex-1 bg-bg">
      <View className="px-4 pt-3 pb-2 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text">Chat</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        className="bg-surface"
        renderItem={({ item }) => <ConversationRow conversation={item} />}
        ListEmptyComponent={
          <EmptyState title="No conversations yet" body="Messages with neighbors will show up here." />
        }
      />
    </View>
  );
}
