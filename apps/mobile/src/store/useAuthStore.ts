import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { currentUser } from "../lib/mockData";
import { zustandStorage } from "../lib/storage/zustandStorage";

type AuthState = {
  // Mock display profile (name, initials, counts) — unrelated to the real
  // session below until stage-9-profile's GET /v1/users/me exists.
  user: typeof currentUser;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;

  // Real session, from backend/api-go's OTP verify (see lib/api/authApi.ts).
  token: string | null;
  phone: string | null;
  isAuthenticated: boolean;
  signIn: (token: string, phone: string) => void;
  signOut: () => void;
};

// Persisted on-device via MMKV (native) / localStorage (web) — see
// lib/storage/zustandStorage.*, same real-divergence reasoning as
// lib/db/postsRepo.* (MMKV/nitro-sqlite are native-only NitroModules).
//
// The Bearer token is stored here in plaintext MMKV/localStorage per
// explicit direction — for stronger-than-MVP hardening later, move it to
// expo-secure-store (Keychain/Keystore-backed) instead and keep this
// persisted slice to non-sensitive state only.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: currentUser,
      isPublic: true,
      setIsPublic: (isPublic) => set({ isPublic }),

      token: null,
      phone: null,
      isAuthenticated: false,
      signIn: (token, phone) => set({ token, phone, isAuthenticated: true }),
      signOut: () => set({ token: null, phone: null, isAuthenticated: false }),
    }),
    {
      name: "coarea-auth",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
