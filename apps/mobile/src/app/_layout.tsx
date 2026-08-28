import "../global.css";

import { useEffect, useState } from "react";
import { Slot, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../store/useAuthStore";

function AuthGate({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const segments = useSegments();

  useEffect(() => {
    if (hydrated) return;
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/signin");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [hydrated, isAuthenticated, segments]);

  if (!hydrated) return null;
  return <>{children}</>;
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthGate>
        <Slot />
      </AuthGate>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
