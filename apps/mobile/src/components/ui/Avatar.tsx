import { Text, View } from "react-native";

type AvatarProps = {
  initials: string;
  size?: number;
};

export function Avatar({ initials, size = 40 }: AvatarProps) {
  return (
    <View
      className="items-center justify-center rounded-full bg-brand-soft border border-border"
      style={{ width: size, height: size }}
    >
      <Text className="text-brand font-semibold" style={{ fontSize: size * 0.38 }}>
        {initials}
      </Text>
    </View>
  );
}
