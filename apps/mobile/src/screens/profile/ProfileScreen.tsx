import { ScrollView, Text, View } from "react-native";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { StatItem } from "../../components/profile/StatItem";
import { useAuthStore } from "../../store/useAuthStore";

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView className="flex-1 bg-bg">
      <View className="px-4 pt-3 pb-2 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text">Profile</Text>
      </View>

      <ProfileHeader user={user} />

      <View className="flex-row bg-surface border-b border-border py-4">
        <StatItem label="Posts" value={user.postCount} />
        <StatItem label="Events" value={user.eventCount} />
      </View>
    </ScrollView>
  );
}
