import { useState } from "react";
import { Pressable, Text } from "react-native";
import { sendFriendRequest } from "../../lib/api/friendsApi";
import { useAuthStore } from "../../store/useAuthStore";

type AddFriendButtonProps = {
  userId: string;
  userName: string;
};

// Same standalone shape as BlockUserButton — calls sendFriendRequest
// directly and shows an inline result, no state the caller needs to wire.
export function AddFriendButton({ userId, userName }: AddFriendButtonProps) {
  const token = useAuthStore((s) => s.token);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "accepted" | "error">("idle");

  async function handlePress() {
    if (!token || status === "sending" || status === "sent" || status === "accepted") return;
    setStatus("sending");
    try {
      const result = await sendFriendRequest(token, userId);
      setStatus(result.status === "accepted" ? "accepted" : "sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <Text className="text-xs font-semibold text-text-muted">Request sent</Text>;
  }
  if (status === "accepted") {
    return <Text className="text-xs font-semibold text-text-muted">Friends with {userName}</Text>;
  }

  return (
    <Pressable onPress={handlePress} disabled={status === "sending"} hitSlop={8}>
      <Text className="text-xs font-semibold text-brand">
        {status === "sending" ? "Sending…" : status === "error" ? "Couldn't send, try again" : "Add friend"}
      </Text>
    </Pressable>
  );
}
