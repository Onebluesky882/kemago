'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { useAuth } from '@/hooks/use-auth'

const NAV_LINKS = [
  { href: '/forum', label: 'Forum' },
  { href: '/roadmap', label: 'Roadmap' },
]

const linkStyle = {
  color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none',
  padding: '6px 12px', borderRadius: 6, display: 'block',
}

export function Navbar() {
  const { user, isLoading } = useAuthStore()
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)

  function handleSignOut() {
    setOpen(false)
    signOut()
  }

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(250,250,250,0.88)',
        backdropFilter: 'blur(12px)',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--text)', textDecoration: 'none' }}>
          YourApp
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="nav-desktop">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={linkStyle}>{l.label}</Link>
          ))}

          {isLoading ? (
            <div style={{ width: 80, height: 32, borderRadius: 6, background: 'var(--surface-2)', marginLeft: 8 }} />
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', textDecoration: 'none' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>
                  {user.name[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{user.name}</span>
              </Link>
              <button onClick={signOut}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                style={{ fontSize: 13, color: '#ef4444', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', cursor: 'pointer', padding: '5px 12px', borderRadius: 6, fontWeight: 500, transition: 'all 150ms' }}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
              <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>Sign in</Link>
              <Link href="/login" style={{ background: 'var(--text)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '6px 14px', borderRadius: 6 }}>Sign in</Link>
            </div>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="nav-hamburger"
          onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'var(--text)', display: 'none' }}
          aria-label="Menu"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="nav-mobile-menu" style={{
          position: 'fixed', top: 56, left: 0, right: 0, zIndex: 49,
          background: 'rgba(250,250,250,0.97)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)', padding: '16px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ ...linkStyle, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 15 }}>
              {l.label}
            </Link>
          ))}

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', textDecoration: 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{user.name}</span>
                </Link>
                <button onClick={handleSignOut}
                  style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'center' }}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  style={{ border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                  Sign in
                </Link>
                <Link href="/login" onClick={() => setOpen(false)}
                  style={{ background: 'var(--text)', color: '#fff', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  )
}
