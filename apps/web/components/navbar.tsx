'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { useAuth } from '@/hooks/use-auth'

export function Navbar() {
  const { user, isLoading } = useAuthStore()
  const { signOut } = useAuth()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(8,8,8,0.85)',
      backdropFilter: 'blur(12px)',
      padding: '0 24px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link href="/" style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--text)', textDecoration: 'none' }}>
        GoverAgent
      </Link>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link href="/showcase" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>
          Showcase
        </Link>
        <Link href="/forum" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>
          Forum
        </Link>
        <Link href="/pricing" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>
          Pricing
        </Link>

        {isLoading ? (
          <div style={{ width: 80, height: 32, borderRadius: 6, background: 'var(--surface-2)' }} />
        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>
                {user.name[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{user.name}</span>
            </div>
            <button
              onClick={signOut}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              style={{ fontSize: 13, color: '#ef4444', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', cursor: 'pointer', padding: '5px 12px', borderRadius: 6, fontWeight: 500, transition: 'all 150ms' }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>
              Sign in
            </Link>
            <Link href="/pricing" style={{ background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '6px 14px', borderRadius: 6 }}>
              Buy now
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
