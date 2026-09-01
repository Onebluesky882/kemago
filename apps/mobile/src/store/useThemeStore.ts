import { Uniwind } from "uniwind";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../lib/storage/zustandStorage";

// "system" follows the OS light/dark setting (uniwind's generated `dark`
// variant already has a prefers-color-scheme fallback baked in); "light"/
// "dark" pin the app to one regardless of the OS setting.
export type ThemePreference = "light" | "dark" | "system";

type ThemeState = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

// Persisted on-device via MMKV (native) / localStorage (web), same as
// useAuthStore — see lib/storage/zustandStorage.*.
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: "system",
      setPreference: (preference) => {
        Uniwind.setTheme(preference);
        set({ preference });
      },
    }),
    {
      name: "kemago-theme",
      storage: createJSONStorage(() => zustandStorage),
      // Applies the persisted preference to uniwind on cold start — the
      // store's initial state alone doesn't call Uniwind.setTheme(), only
      // setPreference() does.
      onRehydrateStorage: () => (state) => {
        if (state) Uniwind.setTheme(state.preference);
      },
    },
  ),
);
