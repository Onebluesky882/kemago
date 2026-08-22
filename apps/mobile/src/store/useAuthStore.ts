import { create } from "zustand";
import { currentUser } from "../lib/mockData";

type AuthState = {
  user: typeof currentUser;
};

// Mock session until stage-5-auth wires up the real Bearer/JWT flow.
export const useAuthStore = create<AuthState>(() => ({
  user: currentUser,
}));
