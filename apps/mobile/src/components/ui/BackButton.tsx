import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../../theme/colors";

// Every inner page (anything that isn't a root tab) needs one of these —
// see CLAUDE.md → Navigation Rules. Uses router.back() rather than a
// hardcoded path since a page can be reached from more than one place.
export function BackButton() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} hitSlop={12} className="p-1 -ml-1">
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M15 18l-6-6 6-6" />
      </Svg>
    </Pressable>
  );
}
