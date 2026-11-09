import { Text, type TextProps } from "react-native";

type FontWeight = "light" | "thin" | "text" | "medium" | "semibold" | "bold";

type AppTextProps = TextProps & {
  children: React.ReactNode;
  weight?: FontWeight;
};

const fontFamilies: Record<FontWeight, string> = {
  light: "SukhumvitLight",
  bold: "SukhumvitBold",
  medium: "SukhumvitMedium",
  semibold: "SukhumvitSemiBold",
  text: "SukhumvitText",
  thin: "SukhumvitThin",
};

export function AppText({
  children,
  weight = "text",
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fontFamilies[weight],
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
