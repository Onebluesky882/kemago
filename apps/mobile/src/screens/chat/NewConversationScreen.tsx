import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../../components/ui/BackButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { VerifiedBadge } from "../../components/ui/VerifiedBadge";
import { createDirectConversation, createGroupConversation } from "../../lib/api/chatApi";
import { type FriendEntry, listFriends } from "../../lib/api/friendsApi";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeColors } from "../../theme/colors";

// Minimal MVP: picking DM/group recipients is scoped to your friends list —
// no general user search exists elsewhere in this app to reuse yet.
export function NewConversationScreen() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const themeColors = useThemeColors();

  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupMode, setGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const result = await listFriends(token);
        if (!cancelled) setFriends(result);
      } catch {
        // Empty list stands in for "couldn't load" — no toast pattern here yet.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  function toggleSelected(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function handleStartDm(friend: FriendEntry) {
    if (!token || busy) return;
    setBusy(true);
    try {
      const conversation = await createDirectConversation(token, friend.userId);
      router.replace({
        pathname: "/chat/[id]",
        params: { id: conversation.id, type: "dm", title: friend.name },
      });
    } catch {
      setBusy(false);
    }
  }

  async function handleCreateGroup() {
    const name = groupName.trim();
    if (!token || !name || selected.size === 0 || busy) return;
    setBusy(true);
    try {
      const conversation = await createGroupConversation(token, { name, memberIds: Array.from(selected) });
      router.replace({ pathname: "/chat/[id]", params: { id: conversation.id, type: "group", title: name } });
    } catch {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]}>
      <View className="flex-row items-center px-4 pt-3 pb-2 bg-surface border-b border-border gap-3">
        <BackButton />
        <Text className="text-base font-bold text-text flex-1">{groupMode ? "New group" : "New message"}</Text>
        <Pressable onPress={() => setGroupMode((v) => !v)} hitSlop={8}>
          <Text className="text-xs font-semibold text-brand">{groupMode ? "Cancel" : "New group"}</Text>
        </Pressable>
      </View>

      {groupMode ? (
        <View className="px-4 pt-3 pb-2 bg-surface border-b border-border">
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Group name…"
            placeholderTextColor={themeColors.textMuted}
            className="border border-border rounded-lg px-3.5 py-2.5 text-sm text-text bg-bg mb-2"
          />
          <Pressable
            onPress={handleCreateGroup}
            disabled={!groupName.trim() || selected.size === 0 || busy}
            className={`items-center rounded-full px-4 py-2.5 ${
              groupName.trim() && selected.size > 0 && !busy ? "bg-brand" : "bg-border"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                groupName.trim() && selected.size > 0 ? "text-white" : "text-text-muted"
              }`}
            >
              {busy ? "Creating…" : `Create group (${selected.size} selected)`}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 items-center justify-center bg-bg">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView className="bg-bg">
          {friends.length === 0 ? (
            <EmptyState title="No friends yet" body="Add friends to start a chat with them." />
          ) : (
            friends.map((friend) => {
              const isSelected = selected.has(friend.userId);
              return (
                <Pressable
                  key={friend.userId}
                  disabled={busy}
                  onPress={() => (groupMode ? toggleSelected(friend.userId) : handleStartDm(friend))}
                  className="flex-row items-center justify-between px-4 py-3.5 border-b border-border"
                >
                  <View className="flex-row items-center gap-1">
                    <Text className="text-sm font-semibold text-text">{friend.name}</Text>
                    {friend.verified ? <VerifiedBadge size={11} /> : null}
                  </View>
                  {groupMode ? (
                    <View
                      className={`w-5 h-5 rounded-full border ${
                        isSelected ? "bg-brand border-brand" : "border-border"
                      }`}
                    />
                  ) : null}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
