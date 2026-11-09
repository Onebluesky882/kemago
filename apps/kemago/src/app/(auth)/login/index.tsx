import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { authClient } from "@/lib/auth-client";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert(
          "เข้าสู่ระบบไม่สำเร็จ",
          error.message ?? "กรุณาตรวจสอบอีเมลและรหัสผ่าน",
        );
        return;
      }

      Alert.alert("สำเร็จ", "เข้าสู่ระบบเรียบร้อยแล้ว");
    } catch {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-10">
          <Text className="mb-3 text-4xl font-bold text-neutral-900">
            Kin Arai
          </Text>

          <Text className="text-base text-neutral-500">
            ยินดีต้อนรับกลับมา เข้าสู่ระบบเพื่อใช้งานต่อ
          </Text>
        </View>

        <View className="mb-5">
          <Text className="mb-2 font-semibold text-neutral-800">Email</Text>

          <TextInput
            className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base text-neutral-900"
            placeholder="you@example.com"
            placeholderTextColor="#A3A3A3"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 font-semibold text-neutral-800">Password</Text>

          <TextInput
            className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-base text-neutral-900"
            placeholder="กรอกรหัสผ่าน"
            placeholderTextColor="#A3A3A3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            editable={!isLoading}
            onSubmitEditing={handleLogin}
            returnKeyType="go"
          />
        </View>

        <Pressable
          className={`items-center rounded-2xl bg-yellow-400 py-4 ${
            isLoading ? "opacity-60" : "active:opacity-80"
          }`}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#171717" />
          ) : (
            <Text className="text-base font-bold text-neutral-900">
              เข้าสู่ระบบ
            </Text>
          )}
        </Pressable>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-neutral-500">ยังไม่มีบัญชี? </Text>

          <Pressable
            onPress={() =>
              Alert.alert("สมัครสมาชิก", "คุณสามารถเพิ่มหน้าสมัครสมาชิกได้")
            }
          >
            <Text className="font-bold text-neutral-900">สมัครสมาชิก</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
