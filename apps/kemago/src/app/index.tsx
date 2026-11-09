import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { authClient } from "../lib/auth-client";
const Index = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const { data: user, isPending } = authClient.useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock API: จำลองว่ามีข้อมูล
      setHasData(true);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && hasData) {
      router.replace("/home");
    }
  }, [loading, hasData, router]);

  // no user session
  // if (!user) {
  //   router.replace("/(auth)/login");
  // }

  // ! build ui
  if (user) {
    router.replace("/home");
  }

  return (
    <View className="flex-1 items-center justify-center bg-orange-50 px-6">
      <Text className="mb-6 text-7xl">🍜</Text>

      <Text className="mb-3 text-4xl font-extrabold text-neutral-900">
        WantToEat?
      </Text>

      <Text className="mb-3 text-center text-xl font-semibold text-orange-500">
        Hungry but don't know what to eat?
      </Text>

      <Text className="mb-8 text-center text-base leading-7 text-neutral-500">
        No more wasting time deciding.
        {"\n"}
        Let's find something delicious for you!
      </Text>

      <ActivityIndicator size="large" color="#04C755" />

      <Text className="mt-4 text-sm text-neutral-400">
        Finding something delicious...
      </Text>
    </View>
  );
};

export default Index;
