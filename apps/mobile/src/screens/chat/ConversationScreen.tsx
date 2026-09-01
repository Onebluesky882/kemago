import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import { BackButton } from "../../components/ui/BackButton";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  type ApiMessage,
  type ConversationMember,
  listConversationMembers,
  listMessages,
  markConversationRead,
  sendImageMessage,
  sendMessage,
} from "../../lib/api/chatApi";
import { useConversationRealtime } from "../../lib/realtime";
import { formatRelativeTime } from "../../lib/time";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeColors, type ThemeColors } from "../../theme/colors";

// A message counts as "read by" a member once that member's last_read_at
// (see chatApi.ts's ConversationMember.lastReadAt) passes the message's
// createdAt — derived from the members list rather than tracked per
// message-per-user, same reasoning as backend/api-go/internal/chat's
// markRead comment (cheap for large groups, one row per member not one per
// message read).
function readersFor(message: ApiMessage, members: ConversationMember[], selfId: string | null): ConversationMember[] {
  const sentAt = new Date(message.createdAt).getTime();
  return members.filter((m) => m.id !== selfId && new Date(m.lastReadAt).getTime() >= sentAt);
}

function ReadReceipt({ isGroup, readerCount, color }: { isGroup: boolean; readerCount: number; color: string }) {
  const read = readerCount > 0;
  if (isGroup) {
    return read ? <Text style={{ fontSize: 10, color }}>Read by {readerCount}</Text> : null;
  }
  return (
    <Svg width={14} height={10} viewBox="0 0 20 14" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M1 7l4 4L13 3" />
      {read ? <Path d="M8 7l4 4L20 3" /> : null}
    </Svg>
  );
}

function MessageBubble({
  message,
  isMine,
  showSender,
  isGroup,
  readerCount,
  themeColors,
}: {
  message: ApiMessage;
  isMine: boolean;
  showSender: boolean;
  isGroup: boolean;
  readerCount: number;
  themeColors: ThemeColors;
}) {
  return (
    <View className={`px-4 py-1.5 ${isMine ? "items-end" : "items-start"}`}>
      {showSender ? <Text className="text-xs text-text-muted mb-0.5 px-1">{message.senderName}</Text> : null}
      <View
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${isMine ? "bg-brand" : "bg-surface border border-border"}`}
      >
        {message.imageUrl ? (
          <Image
            source={{ uri: message.imageUrl }}
            style={{ width: 200, height: 200, borderRadius: 12, marginBottom: message.content ? 6 : 0 }}
            resizeMode="cover"
          />
        ) : null}
        {message.content ? (
          <Text className={`text-sm ${isMine ? "text-white" : "text-text"}`}>{message.content}</Text>
        ) : null}
      </View>
      <View className="flex-row items-center gap-1 mt-0.5 px-1">
        <Text className="text-[10px] text-text-muted">{formatRelativeTime(message.createdAt)}</Text>
        {isMine ? (
          <ReadReceipt isGroup={isGroup} readerCount={readerCount} color={themeColors.textMuted} />
        ) : null}
      </View>
    </View>
  );
}

export function ConversationScreen() {
  const { id, type, title } = useLocalSearchParams<{ id: string; type?: string; title?: string }>();
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.userId);
  const themeColors = useThemeColors();
  const isGroup = type === "group";

  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [members, setMembers] = useState<ConversationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const markRead = useCallback(() => {
    if (!token || !id) return;
    markConversationRead(token, id).catch(() => {
      // Best-effort — a missed read receipt just means the sender sees a
      // stale checkmark until the next successful call, nothing breaks.
    });
  }, [token, id]);

  const load = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const [messagesResult, membersResult] = await Promise.all([
        listMessages(token, id),
        listConversationMembers(token, id),
      ]);
      setMessages(messagesResult);
      setMembers(membersResult);
    } catch {
      // No toast/alert pattern exists elsewhere in this app yet — the
      // thread just stays empty/stale and the user can pull to retry once
      // that pattern exists.
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    load();
  }, [load]);

  // Mark read once the thread has actually loaded, and again whenever the
  // app comes back to the foreground while this screen is mounted (opening
  // the app to an already-open thread should still clear the unread state).
  useEffect(() => {
    if (loading) return;
    markRead();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") markRead();
    });
    return () => sub.remove();
  }, [loading, markRead]);

  useConversationRealtime(id, (event) => {
    if (event.conversationId !== id) return;
    if (event.type === "message_created") {
      setMessages((prev) => (prev.some((m) => m.id === event.message.id) ? prev : [event.message, ...prev]));
      if (event.message.senderId !== userId) markRead();
    } else if (event.type === "read_receipt") {
      setMembers((prev) =>
        prev.map((m) => (m.id === event.userId ? { ...m, lastReadAt: event.readAt } : m)),
      );
    }
  });

  async function handleSend() {
    const content = draft.trim();
    if (!token || !id || !content || sending) return;
    setSending(true);
    try {
      const message = await sendMessage(token, id, { content });
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [message, ...prev]));
      setDraft("");
    } catch {
      // Draft stays filled in so the user can retry — same convention as
      // ClubsScreen's create-club composer.
    } finally {
      setSending(false);
    }
  }

  async function handlePickImage() {
    if (!token || !id || sending) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const contentType = asset.mimeType ?? "image/jpeg";

    setSending(true);
    try {
      const message = await sendImageMessage(token, id, { uri: asset.uri, contentType });
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [message, ...prev]));
    } catch {
      // Same no-toast convention as above.
    } finally {
      setSending(false);
    }
  }

  const headerTitle = title ?? (type === "group" ? "Group" : "Chat");

  return (
    <SafeAreaView edges={["top", "bottom"]}>
      <View className="flex-row items-center px-4 pt-3 pb-2 bg-surface border-b border-border gap-3">
        <BackButton />
        <Text className="text-base font-bold text-text flex-1" numberOfLines={1}>
          {headerTitle}
        </Text>
      </View>

      <KeyboardAvoidingView className="bg-bg" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {loading ? (
          <View className="flex-1 items-center justify-center bg-bg">
            <ActivityIndicator />
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1 bg-bg">
            <EmptyState title="No messages yet" body="Say hello to get the conversation started." />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            className="bg-bg"
            contentContainerStyle={{ paddingVertical: 8 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {[...messages].reverse().map((item, index, oldestFirst) => {
              const isMine = item.senderId === userId;
              const prevOlder = oldestFirst[index - 1];
              const showSender = isGroup && !isMine && prevOlder?.senderId !== item.senderId;
              const readerCount = isMine ? readersFor(item, members, userId).length : 0;
              return (
                <MessageBubble
                  key={item.id}
                  message={item}
                  isMine={isMine}
                  showSender={showSender}
                  isGroup={isGroup}
                  readerCount={readerCount}
                  themeColors={themeColors}
                />
              );
            })}
          </ScrollView>
        )}

        <View className="flex-row items-end gap-2 px-3 py-2 bg-surface border-t border-border">
          <Pressable onPress={handlePickImage} disabled={sending} hitSlop={8} className="p-2">
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={themeColors.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <Rect x="3" y="5" width="18" height="14" rx="2" />
              <Path d="M3 16l5-5 4 4 3-3 6 6" />
            </Svg>
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor={themeColors.textMuted}
            multiline
            className="flex-1 border border-border rounded-2xl px-3.5 py-2.5 text-sm text-text bg-bg max-h-28"
          />
          <Pressable
            onPress={handleSend}
            disabled={!draft.trim() || sending}
            className={`rounded-full px-4 py-2.5 ${draft.trim() && !sending ? "bg-brand" : "bg-border"}`}
          >
            {sending ? (
              <ActivityIndicator size="small" color={themeColors.textMuted} />
            ) : (
              <Text className={`text-sm font-semibold ${draft.trim() ? "text-white" : "text-text-muted"}`}>
                Send
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
