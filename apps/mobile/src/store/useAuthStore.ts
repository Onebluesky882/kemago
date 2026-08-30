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

  // Real session, from backend/better-auth's OTP sign-in (see lib/api/authApi.ts).
  // The token value itself never changes on renewal — Better Auth extends
  // the same token's expiry server-side (session.updateAge) rather than
  // issuing a new one, so there's no setToken action here.
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  signIn: (token: string, email: string) => void;
  signOut: () => void;

  // Whether GET /api/auth/get-session has confirmed the user filled in their info
  // yet (see lib/api/authApi.ts). null = not checked this session — the
  // root layout's AuthGate holds routing until this resolves, so a
  // returning user with a complete profile never flashes through the
  // complete-profile screen. Reset to null on every sign-in/out since it's
  // server truth, not something to trust from a stale persisted value.
  profileComplete: boolean | null;
  profileName: string | null;
  setProfile: (p: { name: string; profileComplete: boolean }) => void;
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
      email: null,
      isAuthenticated: false,
      signIn: (token, email) => set({ token, email, isAuthenticated: true, profileComplete: null }),
      signOut: () =>
        set({
          token: null,
          email: null,
          isAuthenticated: false,
          profileComplete: null,
          profileName: null,
        }),

      profileComplete: null,
      profileName: null,
      setProfile: ({ name, profileComplete }) => set({ profileName: name, profileComplete }),
    }),
    {
      name: "kemago-auth",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
