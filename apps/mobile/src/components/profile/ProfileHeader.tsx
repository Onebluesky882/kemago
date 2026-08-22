import { Text, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import type { currentUser } from "../../lib/mockData";

export function ProfileHeader({ user }: { user: typeof currentUser }) {
  return (
    <View className="items-center py-8 border-b border-border">
      <Avatar initials={user.initials} size={72} />
      <Text className="text-lg font-semibold text-text mt-3">{user.name}</Text>
      <Text className="text-sm text-text-muted">{user.neighborhood} neighbor</Text>
    </View>
  );
}
