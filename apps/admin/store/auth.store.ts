import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = { id: string; name: string; email: string; role: 'owner' | 'client' | 'member' }

type AuthStore = {
  user: User | null
  token: string | null
  isLoading: boolean
  hasHydrated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setHasHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false)
          state.setHasHydrated(true)
        }
      },
    },
  ),
)
