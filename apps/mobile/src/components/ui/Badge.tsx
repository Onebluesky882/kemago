import { Text, View } from "react-native";

type BadgeProps = {
  label: string;
  tone?: "brand" | "accent" | "neutral";
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, { bg: string; text: string }> = {
  brand: { bg: "bg-brand-soft", text: "text-brand" },
  accent: { bg: "bg-orange-50", text: "text-accent" },
  neutral: { bg: "bg-bg", text: "text-text-muted" },
};

export function Badge({ label, tone = "brand" }: BadgeProps) {
  const { bg, text } = toneClasses[tone];
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${bg}`}>
      <Text className={`text-xs font-medium ${text}`}>{label}</Text>
    </View>
  );
}
