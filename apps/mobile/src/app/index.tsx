import { Redirect } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";

// The single unambiguous entry point for "/" — resolves before AuthGate's
// effect-based redirect (in _layout.tsx) fires, avoiding an ambiguous
// initial route now that both (auth) and (tabs) groups exist.
export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/signin"} />;
}
