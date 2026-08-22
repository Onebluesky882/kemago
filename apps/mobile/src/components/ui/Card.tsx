import { Pressable, View, type ViewProps } from "react-native";

type CardProps = ViewProps & {
  onPress?: () => void;
};

export function Card({ onPress, className = "", children, ...rest }: CardProps) {
  const base = `bg-surface border border-border rounded-lg p-4 ${className}`;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={base}
        style={({ pressed }) => [{ transform: [{ translateY: pressed ? 1 : 0 }] }]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={base} {...rest}>
      {children}
    </View>
  );
}
