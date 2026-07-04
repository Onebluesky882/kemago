'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.55s ${delay}s ease, transform 0.55s ${delay}s ease`,
    }}>
      {children}
    </div>
  )
}

const SERVICES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    title: 'Payment Gateway',
    desc: 'Accept payments by card or cryptocurrency — secure checkout, ready to connect.',
    tag: 'Payments',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: 'Security',
    desc: 'Encrypted secrets, protected APIs, and verified requests — security built in from day one.',
    tag: 'Security',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6" />
      </svg>
    ),
    title: 'Database',
    desc: 'A reliable, ready-to-use database for storing all of your app\'s data.',
    tag: 'Database',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
    title: 'File Storage',
    desc: 'Secure cloud storage for uploads — photos, documents, and files.',
    tag: 'Storage',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Authentication',
    desc: 'Sign up, sign in, and manage user permissions out of the box.',
    tag: 'Auth',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path d="M12 8V4M8 4h8" />
        <circle cx="9" cy="14" r="1" />
        <circle cx="15" cy="14" r="1" />
      </svg>
    ),
    title: 'AI Assistant',
    desc: 'A built-in AI assistant that can help edit, update, and manage your site.',
    tag: 'AI',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    title: 'Chat Bot Integration',
    desc: 'Connect a chat bot to talk with your customers on their favorite messaging app.',
    tag: 'Bot',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Community Forum',
    desc: 'Q&amp;A board to connect and engage with your users.',
    tag: 'Forum',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    title: 'Admin Dashboard',
    desc: 'Overview, user management, and reports — all in one place.',
    tag: 'Dashboard',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: 'Project Roadmap',
    desc: 'Track milestones and project progress at a glance.',
    tag: 'Planning',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: 'Email Notifications',
    desc: 'Automatic emails triggered by signups, orders, and key events.',
    tag: 'Email',
  },
]

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(250,250,250,0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.04em' }}>YourApp</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Link href="/roadmap" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', padding: '7px 12px', borderRadius: 'var(--radius-sm)', transition: 'color 150ms', fontWeight: 500 }}>Roadmap</Link>
            <Link href="/forum" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', padding: '7px 12px', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>Forum</Link>
            <Link href="/dashboard" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              Dashboard <ArrowRight />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '104px 24px 88px', textAlign: 'center' }}>

          <div className="anim-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 32, background: 'var(--surface)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-dot 2s ease infinite' }} />
            Starter Template — Ready to use
          </div>

          <h1 className="anim-fade-up-1" style={{ fontSize: 'clamp(36px, 7vw, 62px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.05em', marginBottom: 20 }}>
            Build your own<br />
            <span style={{ color: 'var(--accent)' }}>software product</span>
          </h1>

          <p className="anim-fade-up-2" style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 40px', fontWeight: 400 }}>
            A full-stack starter with payment, auth, forum, and dashboard — no setup from scratch.
          </p>

          <div className="anim-fade-up-3" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn-primary">
              Get started <ArrowRight />
            </Link>
            <Link href="/roadmap" className="btn-secondary">
              View Roadmap
            </Link>
          </div>

        </div>
      </section>

      <hr className="divider" />

      {/* Services */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>

        <FadeSection>
          <div style={{ marginBottom: 52 }}>
            <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Services included</p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.15 }}>
              Everything your product needs
            </h2>
          </div>
        </FadeSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(272px, 1fr))', gap: 14 }}>
          {SERVICES.map((s, i) => (
            <FadeSection key={s.title} delay={i * 0.06}>
              <div className="card" style={{ padding: '26px 24px', height: '100%' }}>
                <div className="icon-box" style={{ marginBottom: 18 }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 18 }}>{s.desc}</p>
                <span className="tag tag-neutral">{s.tag}</span>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* CTA */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <FadeSection>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 16, lineHeight: 1.15 }}>
            Ready to start building?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.7 }}>
            Sign in to manage your project
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn-primary">
              Dashboard <ArrowRight />
            </Link>
            <Link href="/roadmap" className="btn-secondary">
              Roadmap
            </Link>
          </div>
        </FadeSection>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 1000, margin: '0 auto' }}>
        <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.03em' }}>YourApp</span>
        <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>© 2025</span>
      </footer>

    </div>
  )
}
