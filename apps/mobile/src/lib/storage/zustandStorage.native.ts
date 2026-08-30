import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

// Backs Zustand's persist() middleware on iOS/Android. MMKV is a NitroModule
// (native-only, no web build) — see zustandStorage.web.ts for the browser
// equivalent with the same StateStorage shape.

const mmkv = createMMKV({ id: "kemago-app-storage" });

export const zustandStorage: StateStorage = {
  getItem: (name) => mmkv.getString(name) ?? null,
  setItem: (name, value) => mmkv.set(name, value),
  removeItem: (name) => mmkv.remove(name),
};
