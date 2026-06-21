'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useAuth } from '@/hooks/use-auth'
import { Navbar } from '@/components/navbar'

const QUICK_LINKS = [
  { label: 'Forum', desc: 'Ask questions & get help', href: '/forum', icon: '💬' },
  { label: 'Showcase', desc: 'See what others built', href: '/showcase', icon: '🚀' },
  { label: 'Pricing', desc: 'Upgrade your plan', href: '/pricing', icon: '💳' },
]

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore()
  const { signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return <div style={{ background: 'var(--bg)', minHeight: '100vh' }} />
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Navbar />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 8 }}>Welcome back</p>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            {user.name}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{user.email}</p>
        </div>

        {/* Access template card */}
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 14, padding: '24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(ellipse at top right, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <p style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Template Access</p>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>GoverAgent Template</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
            Clone the private repo and start building your product with AI.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a
              href="https://github.com/Onebluesky882/goveragent-template"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '9px 18px', borderRadius: 8, display: 'inline-block' }}
            >
              Open on GitHub →
            </a>
            <Link
              href="/forum"
              style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 13, textDecoration: 'none', padding: '9px 18px', borderRadius: 8, display: 'inline-block' }}
            >
              Ask a question
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 40 }}>
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <div className="card-hover" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
                <span style={{ fontSize: 20, display: 'block', marginBottom: 8 }}>{link.icon}</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{link.label}</p>
                <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          style={{ fontSize: 13, color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Sign out
        </button>

      </div>
    </div>
  )
}
