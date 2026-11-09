import { StatusBar } from "expo-status-bar";
import { AppText } from "../components/AppText";
import { View } from "react-native";

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <AppText className="text-red-400" weight="bold">
        สวัสดี
      </AppText>
      <StatusBar style="auto" />
    </View>
  );
}
