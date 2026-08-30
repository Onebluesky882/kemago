// EXPO_PUBLIC_* env vars are inlined at build time and readable client-side
// (Expo's convention for values that are fine to ship in the app bundle —
// never put secrets here). Defaults to localhost for the iOS
// Simulator/web, where "localhost" reaches the host machine directly.
// A physical device or Android emulator needs a real override:
//   Android emulator: http://10.0.2.2:3001
//   Physical device:  http://<your-lan-ip>:3001
//
// backend/api-go (Go, renamed from ws-go once it grew past just
// websockets) — owns every domain except auth (rooms, posts, comments,
// likes, and any future domain), per DECISIONS.md → "Backend Domain
// Ownership — TypeScript Is Auth-Only". Port 3001 matches its
// docker-compose WS_PORT env var name, kept as-is through the rename.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

// backend/better-auth (Bun + Better Auth, deployed separately to Railway) —
// owns auth/session/profile. Not the same service as API_BASE_URL above.
export const AUTH_BASE_URL = process.env.EXPO_PUBLIC_AUTH_URL ?? "http://localhost:3002";
