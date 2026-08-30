import { Pressable, Text } from "react-native";

type RoomChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

// Same visual style as CategoryChip, but generic — CategoryChip is typed
// specifically to FeedFilter's fixed category list.
export function RoomChip({ label, active, onPress }: RoomChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-3.5 py-2 mr-2 border ${
        active ? "bg-brand border-brand" : "bg-surface border-border"
      }`}
    >
      <Text className={`text-xs font-medium ${active ? "text-white" : "text-text-muted"}`}>{label}</Text>
    </Pressable>
  );
}
