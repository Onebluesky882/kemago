import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ConversationRow } from "../../components/chat/ConversationRow";
import { EmptyState } from "../../components/ui/EmptyState";
import { type ApiConversation, listConversations } from "../../lib/api/chatApi";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeColors } from "../../theme/colors";

export function ChatScreen() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const themeColors = useThemeColors();

  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const result = await listConversations(token);
      setConversations(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text">Chat</Text>
        <Pressable onPress={() => router.push("/chat/new")} hitSlop={10} className="p-1">
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={themeColors.brand} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 5v14M5 12h14" />
          </Svg>
        </Pressable>
      </View>

      <ScrollView
        className="bg-bg"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {conversations.length === 0 ? (
          !loading ? (
            <EmptyState
              title={error ? "Couldn't load chats" : "No conversations yet"}
              body={error ? "Pull down to try again." : "Start a conversation with a friend or a group."}
            />
          ) : null
        ) : (
          conversations.map((item) => (
            <ConversationRow
              key={item.id}
              conversation={item}
              onPress={(c) =>
                router.push({
                  pathname: "/chat/[id]",
                  params: {
                    id: c.id,
                    type: c.type,
                    title: c.type === "dm" ? (c.otherUser?.name ?? "Unknown") : c.name,
                  },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
