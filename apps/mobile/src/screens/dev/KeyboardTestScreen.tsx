import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../../components/ui/BackButton";
import { colors } from "../../theme/colors";

type FieldConfig = {
  key: string;
  label: string;
  placeholder: string;
  keyboardType: "default" | "email-address" | "numeric";
  multiline?: boolean;
  secure?: boolean;
};

const fields: FieldConfig[] = [
  { key: "text", label: "Default keyboard", placeholder: "Type anything…", keyboardType: "default" },
  { key: "email", label: "Email keyboard", placeholder: "you@example.com", keyboardType: "email-address" },
  { key: "numeric", label: "Numeric keyboard", placeholder: "123456", keyboardType: "numeric" },
  {
    key: "multiline",
    label: "Multiline (auto-grow)",
    placeholder: "Write a few lines…",
    keyboardType: "default",
    multiline: true,
  },
];

// Diagnostic screen for manually verifying keyboard/touch behavior on real
// iOS devices and simulators — different keyboard types, focus state, and
// whether KeyboardAvoidingView actually keeps a bottom-of-scroll input
// clear of the keyboard. Not part of any product flow; reachable from
// Profile → "Keyboard typing test" for developers.
export function KeyboardTestScreen() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const [bottomValue, setBottomValue] = useState("");
  const [bottomFocused, setBottomFocused] = useState(false);

  return (
    <SafeAreaView edges={["top", "bottom"]}>
      <View className="flex-row items-center px-4 pt-3 pb-2 bg-surface border-b border-border">
        <BackButton />
        <Text className="text-lg font-bold text-text ml-3">Keyboard typing test</Text>
      </View>

      <KeyboardAvoidingView className="bg-bg" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="px-4 pt-4 pb-8" keyboardShouldPersistTaps="handled">
          <View className="bg-surface border border-border rounded-lg px-3.5 py-3 mb-4">
            <Text className="text-xs font-semibold text-text-muted mb-1">STATE</Text>
            <Text className="text-sm text-text">
              Focused field:{" "}
              <Text className="font-semibold">{focusedKey ?? (bottomFocused ? "bottom" : "none")}</Text>
            </Text>
          </View>

          {fields.map((field) => {
            const value = values[field.key] ?? "";
            const isFocused = focusedKey === field.key;
            return (
              <View key={field.key} className="mb-4">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-xs font-medium text-text-muted">{field.label}</Text>
                  <Text className="text-xs text-text-muted">
                    {value.length} chars {isFocused ? "· focused" : ""}
                  </Text>
                </View>
                <TextInput
                  value={value}
                  onChangeText={(text) => setValues((prev) => ({ ...prev, [field.key]: text }))}
                  onFocus={() => setFocusedKey(field.key)}
                  onBlur={() => setFocusedKey((prev) => (prev === field.key ? null : prev))}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType={field.keyboardType}
                  multiline={field.multiline}
                  secureTextEntry={field.secure}
                  autoCapitalize={field.keyboardType === "email-address" ? "none" : "sentences"}
                  autoCorrect={field.keyboardType === "default" && !field.multiline}
                  className={`border rounded-lg px-3.5 py-3 text-base text-text bg-surface ${
                    field.multiline ? "min-h-24" : ""
                  } ${isFocused ? "border-brand" : "border-border"}`}
                  style={field.multiline ? { textAlignVertical: "top" } : undefined}
                />
              </View>
            );
          })}

          {/* Spacer so the bottom field below starts off-screen, proving
              KeyboardAvoidingView actually lifts it clear of the keyboard
              once focused rather than leaving it hidden underneath. */}
          <View style={{ height: 400 }} />

          <View className="mb-2">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-xs font-medium text-text-muted">
                Bottom-of-scroll field (keyboard-avoidance check)
              </Text>
              <Text className="text-xs text-text-muted">
                {bottomValue.length} chars {bottomFocused ? "· focused" : ""}
              </Text>
            </View>
            <TextInput
              value={bottomValue}
              onChangeText={setBottomValue}
              onFocus={() => setBottomFocused(true)}
              onBlur={() => setBottomFocused(false)}
              placeholder="Focus me — the keyboard should not cover this"
              placeholderTextColor={colors.textMuted}
              className={`border rounded-lg px-3.5 py-3 text-base text-text bg-surface ${
                bottomFocused ? "border-brand" : "border-border"
              }`}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
