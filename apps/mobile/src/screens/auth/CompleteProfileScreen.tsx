import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { AuthApiError, updateProfile } from "../../lib/api/authApi";
import { useAuthStore } from "../../store/useAuthStore";
import { colors } from "../../theme/colors";

// No avatar/photo field here — Kemago product rule is initials only, no
// custom profile photos, for anti-impersonation reasons.
export function CompleteProfileScreen() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setProfile = useAuthStore((state) => state.setProfile);
  const token = useAuthStore((state) => state.token);

  const canSubmit = name.trim().length > 0 && !loading;

  async function handleSubmit() {
    if (!canSubmit || !token) return;
    setLoading(true);
    setError(null);
    try {
      const profile = await updateProfile(token, { name: name.trim() });
      setProfile({ name: profile.name, profileComplete: profile.profileComplete });
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof AuthApiError ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-bg justify-center px-6">
      <Text className="text-2xl font-bold text-text mb-1.5">Complete your profile</Text>
      <Text className="text-sm text-text-muted mb-8">
        Tell your neighbors who you are before you get started.
      </Text>

      <Text className="text-xs font-medium text-text-muted mb-1.5">Your name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Jordan Lee"
        placeholderTextColor={colors.textMuted}
        autoFocus
        className="border border-border rounded-lg px-3.5 py-3 text-base text-text bg-surface mb-2"
      />
      {error ? <Text className="text-xs text-accent mb-2">{error}</Text> : null}

      <View className="mt-4">
        <PrimaryButton label="Continue" onPress={handleSubmit} disabled={!canSubmit} loading={loading} />
      </View>
    </View>
  );
}
