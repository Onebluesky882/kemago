import { Text, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import type { currentUser } from "../../lib/mockData";

export function ProfileHeader({ user }: { user: typeof currentUser }) {
  return (
    <View className="items-center py-8 border-b border-border">
      <Avatar initials={user.initials} size={72} />
      <View className="flex-row items-center gap-1 mt-3">
        <Text className="text-lg font-semibold text-text">{user.name}</Text>
        {user.verified ? <VerifiedBadge size={15} /> : null}
      </View>
      <Text className="text-sm text-text-muted">{user.neighborhood} neighbor</Text>
    </View>
  );
}
