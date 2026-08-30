import "../global.css";

import { useEffect, useState } from "react";
import { Slot, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getSession } from "../lib/api/authApi";
import { useAuthStore } from "../store/useAuthStore";

function AuthGate({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const profileComplete = useAuthStore((state) => state.profileComplete);
  const segments = useSegments();

  useEffect(() => {
    if (hydrated) return;
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  // Reading the session on every app launch while signed in both (a)
  // slides the 30-day rolling window forward (Better Auth's
  // session.updateAge extends expiry as a side effect of this read — no
  // separate refresh call exists) and (b) re-checks profile_complete
  // (there's no separate signup screen — OTP verify creates the account
  // and signs in immediately), so a user who closed the app mid-onboarding
  // gets sent back to finish it. A null/failed response means the session
  // is gone (expired or invalid) and signs out.
  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    const { token, setProfile, signOut } = useAuthStore.getState();
    if (!token) return;
    getSession(token)
      .then((profile) => {
        if (!profile) return signOut();
        setProfile({
          name: profile.name,
          profileComplete: profile.profileComplete,
          profilePublic: profile.profilePublic,
        });
      })
      .catch(() => signOut());
  }, [hydrated, isAuthenticated]);

  useEffect(() => {
    if (!hydrated) return;
    const inAuthGroup = segments[0] === "(auth)";
    const onCompleteProfile = (segments as string[])[1] === "complete-profile";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/signin");
    } else if (isAuthenticated && profileComplete === false && !onCompleteProfile) {
      router.replace("/(auth)/complete-profile");
    } else if (isAuthenticated && profileComplete === true && (inAuthGroup || onCompleteProfile)) {
      router.replace("/(tabs)");
    }
  }, [hydrated, isAuthenticated, profileComplete, segments]);

  // Hold routing until profile_complete is known for a signed-in user —
  // otherwise a fully-onboarded user would flash through complete-profile
  // for the instant between hydration and the fetch above resolving.
  if (!hydrated || (isAuthenticated && profileComplete === null)) return null;
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
