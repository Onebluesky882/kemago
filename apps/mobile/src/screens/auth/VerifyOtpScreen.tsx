import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { requestOtp, verifyOtp, AuthApiError } from "../../lib/api/authApi";
import { useAuthStore } from "../../store/useAuthStore";
import { colors } from "../../theme/colors";

// Matches the backend's own cooldown (backend/api-go/internal/otp/otp.go).
const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const signIn = useAuthStore((state) => state.signIn);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const canSubmit = code.trim().length === 6 && !loading;

  async function handleVerify() {
    if (!canSubmit || !phone) return;
    setLoading(true);
    setError(null);
    try {
      const { token } = await verifyOtp(phone, code.trim());
      signIn(token, phone);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof AuthApiError ? e.message : "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendIn > 0 || !phone || resending) return;
    setResending(true);
    setError(null);
    try {
      await requestOtp(phone);
      setResendIn(RESEND_COOLDOWN_SECONDS);
    } catch (e) {
      setError(e instanceof AuthApiError ? e.message : "Couldn't resend — try again shortly.");
    } finally {
      setResending(false);
    }
  }

  return (
    <View className="flex-1 bg-bg justify-center px-6">
      <Text className="text-2xl font-bold text-text mb-1.5">Enter the code</Text>
      <Text className="text-sm text-text-muted mb-8">
        We sent a 6-digit code to {phone ?? "your phone"}.
      </Text>

      <TextInput
        value={code}
        onChangeText={(v) => setCode(v.replace(/[^0-9]/g, "").slice(0, 6))}
        placeholder="000000"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        className="border border-border rounded-lg px-3.5 py-3 text-2xl tracking-[8px] text-center text-text bg-surface mb-2"
      />
      {error ? <Text className="text-xs text-accent mb-2">{error}</Text> : null}

      <View className="mt-4 mb-4">
        <PrimaryButton label="Verify" onPress={handleVerify} disabled={!canSubmit} loading={loading} />
      </View>

      <Pressable onPress={handleResend} disabled={resendIn > 0 || resending}>
        <Text className="text-center text-sm text-text-muted">
          {resendIn > 0 ? `Resend code in ${resendIn}s` : resending ? "Resending…" : "Resend code"}
        </Text>
      </Pressable>
    </View>
  );
}
