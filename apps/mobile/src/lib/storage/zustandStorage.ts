// Type-resolution fallback only — Metro always prefers
// zustandStorage.native.ts (iOS/Android) or zustandStorage.web.ts over this
// file when bundling. See postsRepo.ts for the full explanation.
export * from "./zustandStorage.native";
