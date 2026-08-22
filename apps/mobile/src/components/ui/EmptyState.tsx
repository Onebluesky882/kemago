import { Text, View } from "react-native";

type EmptyStateProps = {
  title: string;
  body: string;
};

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View className="items-center px-8 py-16">
      <Text className="text-base font-semibold text-text mb-1.5">{title}</Text>
      <Text className="text-sm text-text-muted text-center leading-relaxed">{body}</Text>
    </View>
  );
}
