// Type-resolution fallback only — Metro always prefers postsRepo.native.ts
// (iOS/Android) or postsRepo.web.ts over this file when bundling, so this
// code never actually runs. It exists purely so tsc (which doesn't do
// Metro's platform-extension resolution) can resolve the bare
// "../../lib/db/postsRepo" import used by callers, without a repo-wide
// tsconfig change (moduleSuffixes broke NativeWind's FlatList prop types
// globally — see git history / TODO.md).
export * from "./postsRepo.native";
