import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { currentUser } from "../lib/mockData";
import { zustandStorage } from "../lib/storage/zustandStorage";

type AuthState = {
  user: typeof currentUser;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
};

// Mock session until stage-5-auth wires up the real Bearer/JWT flow — once
// that exists, the Bearer token itself should NOT go through persist() in
// plaintext; store it via a secure keychain API instead and keep this
// persisted slice to non-sensitive profile/UI state only.
//
// Persisted on-device via MMKV (native) / localStorage (web) — see
// lib/storage/zustandStorage.*, same real-divergence reasoning as
// lib/db/postsRepo.* (MMKV/nitro-sqlite are native-only NitroModules).
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: currentUser,
      isPublic: true,
      setIsPublic: (isPublic) => set({ isPublic }),
    }),
    {
      name: "coarea-auth",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
