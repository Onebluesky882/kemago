'use client'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

export function useAuth() {
  const router = useRouter()
  const { setUser, setToken, token } = useAuthStore()

  async function signIn(email: string, password: string) {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error('Invalid credentials')
    const data = await res.json()
    setUser(data.user)
    setToken(data.token ?? null)
    router.push('/dashboard')
  }

  async function signUp(name: string, email: string, password: string) {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) throw new Error('Sign up failed')
    const data = await res.json()
    setUser(data.user)
    setToken(data.token ?? null)
    router.push('/dashboard')
  }

  async function signOut() {
    await fetch(`${API}/api/auth/sign-out`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    setUser(null)
    setToken(null)
    router.push('/login')
  }

  return { signIn, signUp, signOut }
}
