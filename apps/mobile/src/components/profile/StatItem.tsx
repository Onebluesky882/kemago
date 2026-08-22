import { Text, View } from "react-native";

export function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View className="items-center flex-1">
      <Text className="text-xl font-bold text-text">{value}</Text>
      <Text className="text-xs text-text-muted mt-0.5">{label}</Text>
    </View>
  );
}
