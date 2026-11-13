import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";
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

  // useEffect(() => {
  //   if (!loading && hasData) {
  //     router.replace("/home");
  //   }
  // }, [loading, hasData, router]);

  // no user session
  // if (!user) {
  //   router.replace("/(auth)/login");
  // }

  // ! build ui
  if (user) {
    router.replace("/home");
  }

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View className="flex-1 justify-center px-3 bg-background ">
      {/* Hero */}

      <View className="items-center mb-8">
        <View className="w-36 h-36 rounded-[40px] bg-orange-100 items-center justify-center mb-7">
          <Text className="text-7xl">🏃</Text>
        </View>

        <Text className="text-4xl font-extrabold text-foreground">Kemago</Text>

        <Text className="text-sport-neon font-bold mt-2">
          Move Together. Grow Together.
        </Text>
      </View>

      {/* Welcome */}

      <View className="mb-8">
        <Text className="text-3xl font-extrabold text-foreground text-center">
          Find Your Workout Buddy
        </Text>

        <Text className="text-base text-neutral-500 text-center mt-4 leading-7">
          Meet people who share your fitness goals.
          {"\n"}
          Stay motivated and get active together!
        </Text>
      </View>

      {/* Login */}

      <Pressable
        onPress={() => router.push("/(auth)/login")}
        className="h-14 bg-orange-500 rounded-2xl items-center justify-center active:opacity-80"
      >
        <Text className="text-white font-bold text-base">Login</Text>
      </Pressable>

      {/* Sign Up */}

      <Pressable
        onPress={() => router.push("/(auth)/login")}
        className="h-14 border-2 border-orange-500 rounded-2xl items-center justify-center mt-4"
      >
        <Text className="text-orange-600 font-bold text-base">
          Create Account
        </Text>
      </Pressable>

      {/* Divider */}

      <View className="flex-row items-center my-7">
        <View className="flex-1 h-px bg-orange-200" />

        <Text className="mx-4 text-neutral-400 text-sm">OR</Text>

        <View className="flex-1 h-px bg-orange-200" />
      </View>

      {/* Guest */}

      <Pressable
        onPress={() => router.replace("/home")}
        className="h-14 bg-white border border-orange-200 rounded-2xl items-center justify-center"
      >
        <Text className="text-neutral-700 font-bold text-base">
          Continue as Guest
        </Text>
      </Pressable>

      {/* Footer */}

      <Text className="text-center text-xs text-neutral-400 mt-4">
        Your journey is better together. ❤️
      </Text>
    </View>
  );
};

export default Index;
