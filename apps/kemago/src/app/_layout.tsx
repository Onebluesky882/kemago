import { useFonts } from "expo-font";
import "../global.css";

import { Slot, Tabs } from "expo-router";

export default function Layout() {
  const [loaded] = useFonts({
    SukhumvitBold: require("../../assets/fonts/Sukhumvit-Bold.ttf"),
    SukhumvitLight: require("../../assets/fonts/Sukhumvit-Light.ttf"),
    SukhumvitMedium: require("../../assets/fonts/Sukhumvit-Medium.ttf"),
    SukhumvitSemiBold: require("../../assets/fonts/Sukhumvit-SemiBold.ttf"),
    SukhumvitText: require("../../assets/fonts/Sukhumvit-Text.ttf"),
    SukhumvitThin: require("../../assets/fonts/Sukhumvit-Thin.ttf"),
  });
  if (!loaded) {
    return null;
  }
  return <Slot />;
}
