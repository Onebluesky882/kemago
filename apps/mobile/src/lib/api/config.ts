// EXPO_PUBLIC_* env vars are inlined at build time and readable client-side
// (Expo's convention for values that are fine to ship in the app bundle —
// never put secrets here). Defaults to localhost for the iOS
// Simulator/web, where "localhost" reaches the host machine directly.
// A physical device or Android emulator needs a real override:
//   Android emulator: http://10.0.2.2:3000
//   Physical device:  http://<your-lan-ip>:3000
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
