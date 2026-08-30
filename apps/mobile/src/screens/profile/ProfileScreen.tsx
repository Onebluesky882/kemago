import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { StatItem } from "../../components/profile/StatItem";
import { signOutRequest, updatePrivacy } from "../../lib/api/authApi";
import { useAuthStore } from "../../store/useAuthStore";
import { colors } from "../../theme/colors";

export function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profilePublic = useAuthStore((state) => state.profilePublic);
  const setProfilePublic = useAuthStore((state) => state.setProfilePublic);
  const token = useAuthStore((state) => state.token);
  const signOut = useAuthStore((state) => state.signOut);

  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const isPublic = profilePublic ?? true;

  // Optimistic-ish: flips the switch immediately, then reconciles with the
  // real persisted value once the server responds. Reverts on failure —
  // no toast/spinner infrastructure exists near this toggle yet, so this
  // keeps it simple for a first pass.
  async function handleTogglePublic(next: boolean) {
    if (!token || savingPrivacy) return;
    setSavingPrivacy(true);
    setProfilePublic(next);
    try {
      const profile = await updatePrivacy(token, next);
      setProfilePublic(profile.profilePublic);
    } catch {
      setProfilePublic(!next);
    } finally {
      setSavingPrivacy(false);
    }
  }

  // Signs out on-device regardless of whether the server-side call
  // succeeds — a network failure shouldn't trap the user in a signed-in
  // UI they're trying to leave. AuthGate (_layout.tsx) then redirects to
  // /(auth)/signin once isAuthenticated flips false.
  async function handleLogout() {
    if (token) {
      try {
        await signOutRequest(token);
      } catch {
        // best-effort — local sign-out below still happens
      }
    }
    signOut();
  }

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
          onValueChange={handleTogglePublic}
          disabled={savingPrivacy}
          trackColor={{ false: colors.border, true: colors.brand }}
          thumbColor="#ffffff"
        />
      </View>

      <Pressable
        onPress={() => router.push("/friends")}
        className="flex-row items-center justify-between px-4 py-4 bg-surface border-b border-border"
      >
        <Text className="text-sm font-semibold text-text">Friends</Text>
        <Text className="text-xs text-text-muted">View</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/rooms")}
        className="flex-row items-center justify-between px-4 py-4 bg-surface border-b border-border"
      >
        <Text className="text-sm font-semibold text-text">Rooms</Text>
        <Text className="text-xs text-text-muted">View</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/blocked-users")}
        className="flex-row items-center justify-between px-4 py-4 bg-surface border-b border-border"
      >
        <Text className="text-sm font-semibold text-text">Blocked users</Text>
        <Text className="text-xs text-text-muted">View</Text>
      </Pressable>

      <View className="px-4 py-4">
        <Pressable
          onPress={handleLogout}
          className="items-center rounded-full px-4 py-3 border border-accent"
        >
          <Text className="text-sm font-semibold text-accent">Log out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
