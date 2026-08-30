import { useState } from "react";
import { Pressable, Text } from "react-native";
import { blockUser } from "../../lib/api/blocksApi";
import { useAuthStore } from "../../store/useAuthStore";

type BlockUserButtonProps = {
  userId: string;
  userName: string;
};

// Standalone, self-contained — someone else drops this into PostCard.tsx
// (e.g. a long-press menu action or a small icon) without needing anything
// else from this feature. Calls blockUser directly and shows a brief
// inline confirmation; the caller doesn't need to wire any state for it.
export function BlockUserButton({ userId, userName }: BlockUserButtonProps) {
  const token = useAuthStore((s) => s.token);
  const [status, setStatus] = useState<"idle" | "blocking" | "blocked" | "error">("idle");

  async function handlePress() {
    if (!token || status === "blocking" || status === "blocked") return;
    setStatus("blocking");
    try {
      await blockUser(token, userId);
      setStatus("blocked");
    } catch {
      setStatus("error");
    }
  }

  if (status === "blocked") {
    return <Text className="text-xs font-semibold text-text-muted">Blocked {userName}</Text>;
  }

  return (
    <Pressable onPress={handlePress} disabled={status === "blocking"} hitSlop={8}>
      <Text className="text-xs font-semibold text-accent">
        {status === "blocking" ? "Blocking…" : status === "error" ? "Couldn't block, try again" : `Block ${userName}`}
      </Text>
    </Pressable>
  );
}
