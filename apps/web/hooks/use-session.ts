'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useApi } from '@/hooks/use-api'

export function useSession() {
  const { user, isLoading, setUser, setLoading, hasHydrated } = useAuthStore()
  const { apiFetch } = useApi()

  useEffect(() => {
    // Wait for zustand's persist middleware to finish reading the token from
    // localStorage — firing the request before hydration sends no Bearer header.
    if (!hasHydrated) return

    apiFetch('/api/user/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setUser(data?.user ?? null)
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, setUser, setLoading])

  return { user, isLoading: isLoading || !hasHydrated }
}
