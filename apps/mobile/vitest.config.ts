import { defineConfig } from "vitest/config";

// Covers pure TS logic only (no React Native rendering) — files under
// src/lib and small extracted *.logic.ts modules that intentionally avoid
// importing react-native/expo-router so they can run in plain Node. See
// src/screens/notifications/notifications.logic.ts for the pattern.
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});
