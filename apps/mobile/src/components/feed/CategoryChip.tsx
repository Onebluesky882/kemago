import { Pressable, Text } from "react-native";
import type { FeedFilter } from "../../store/useFeedFilterStore";

type CategoryChipProps = {
  label: FeedFilter;
  active: boolean;
  onPress: () => void;
};

export function CategoryChip({ label, active, onPress }: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-3.5 py-2 mr-2 border ${
        active ? "bg-brand border-brand" : "bg-surface border-border"
      }`}
    >
      <Text className={`text-xs font-medium ${active ? "text-white" : "text-text-muted"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
