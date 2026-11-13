import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const index = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(router)/home");
  }, [router]);
  return <View></View>;
};

export default index;
