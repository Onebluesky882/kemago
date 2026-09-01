import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { requestOtp, AuthApiError } from "../../lib/api/authApi";
import { colors } from "../../theme/colors";

// Same shape the backend accepts (see backend/api-go/internal/handlers/otp.go).
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = emailRe.test(email.trim()) && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await requestOtp(email.trim());
      router.push({ pathname: "/verify", params: { email: email.trim() } });
    } catch (e) {
      setError(e instanceof AuthApiError ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1 bg-bg justify-center px-6"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text className="text-2xl font-bold text-text mb-1.5">Welcome to Kemago</Text>
        <Text className="text-sm text-text-muted mb-8">
          Enter your email — we'll send you a code to sign in.
        </Text>

        <Text className="text-xs font-medium text-text-muted mb-1.5">Email address</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          className="border border-border rounded-lg px-3.5 py-3 text-base text-text bg-surface mb-2"
        />
        {error ? <Text className="text-xs text-accent mb-2">{error}</Text> : null}

        <View className="mt-4">
          <PrimaryButton label="Send code" onPress={handleSubmit} disabled={!canSubmit} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
