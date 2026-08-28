import { ActivityIndicator, Pressable, Text } from "react-native";
import { colors } from "../../theme/colors";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, disabled, loading }: PrimaryButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      className={`items-center rounded-full px-4 py-3 ${inactive ? "bg-border" : "bg-brand"}`}
    >
      {loading ? (
        <ActivityIndicator color={colors.textMuted} />
      ) : (
        <Text className={`text-sm font-semibold ${inactive ? "text-text-muted" : "text-white"}`}>{label}</Text>
      )}
    </Pressable>
  );
}
