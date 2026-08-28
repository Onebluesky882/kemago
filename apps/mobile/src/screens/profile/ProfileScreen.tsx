import { ScrollView, Switch, Text, View } from "react-native";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { StatItem } from "../../components/profile/StatItem";
import { useAuthStore } from "../../store/useAuthStore";
import { colors } from "../../theme/colors";

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const isPublic = useAuthStore((state) => state.isPublic);
  const setIsPublic = useAuthStore((state) => state.setIsPublic);

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

      <View className="flex-row items-center justify-between px-4 py-4 bg-surface border-b border-border">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-text">
            {isPublic ? "Public profile" : "Private profile"}
          </Text>
          <Text className="text-xs text-text-muted mt-0.5">
            {isPublic
              ? "Anyone nearby can see your profile and posts."
              : "Only neighbors you approve can see your profile."}
          </Text>
        </View>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ false: colors.border, true: colors.brand }}
          thumbColor="#ffffff"
        />
      </View>
    </ScrollView>
  );
}
