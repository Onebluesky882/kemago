import type { StateStorage } from "zustand/middleware";

// Browser equivalent of zustandStorage.native.ts — react-native-mmkv has no
// web build, so the web bundle falls back to localStorage. Same
// StateStorage shape as the native file.

export const zustandStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Storage unavailable (private browsing, quota) — non-fatal.
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // Non-fatal.
    }
  },
};
