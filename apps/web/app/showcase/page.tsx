import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { BackButton } from '@/components/back-button'

export const metadata = {
  title: 'Showcase — GoverAgent',
  description: 'Projects built with GoverAgent Template — real products shipped by real people.',
}

const PROJECTS = [
  {
    name: 'GoverAgent Platform',
    description: 'The platform you are looking at right now. AI-driven software factory with auth, payments, storage, and community forum.',
    url: 'https://fullstack-builder-web.onebluesky882.workers.dev',
    tags: ['SaaS', 'AI', 'Payments'],
    author: 'Onebluesky882',
    highlight: true,
  },
]

const STATS = [
  { value: '3', label: 'Apps in one deploy' },
  { value: '< 5 min', label: 'From clone to live' },
  { value: '0฿', label: 'Monthly hosting cost' },
]

export default function ShowcasePage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 0' }}><BackButton /></div>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '72px 24px 56px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Showcase</p>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
            Built with<br /><span className="shimmer-text">GoverAgent Template</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>
            Real products shipped by real people — using the same template you can get today.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: 'var(--surface)', padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Projects grid */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {PROJECTS.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div className="card-hover" style={{ background: 'var(--surface)', border: p.highlight ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', height: '100%', boxShadow: p.highlight ? '0 0 40px rgba(124,58,237,0.06)' : 'none', position: 'relative' }}>
                {p.highlight && (
                  <div style={{ position: 'absolute', top: 14, right: 14, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 100, letterSpacing: '0.06em' }}>
                    LIVE
                  </div>
                )}
                {/* Preview placeholder */}
                <div style={{ height: 160, background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0.02) 100%)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,0.3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>

                <div style={{ padding: '18px 20px' }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>{p.name}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>{p.description}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {p.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 100, padding: '2px 10px', fontWeight: 600 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>by {p.author}</span>
                    <span style={{ fontSize: 12, color: 'var(--accent)' }}>View →</span>
                  </div>
                </div>
              </div>
            </a>
          ))}

          {/* Submit your project card */}
          <div style={{ background: 'var(--surface-2)', border: '1px dashed var(--border)', borderRadius: 14, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 280, gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--accent)' }}>+</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Submit your project</p>
              <p style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.5 }}>Built something with GoverAgent?<br />Share it with the community.</p>
            </div>
            <a href="mailto:wansing05@gmail.com?subject=Showcase submission" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Send details →
            </a>
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* CTA */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14 }}>Your project could be here.</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
            Get the template, build your product, ship it. Takes less than a day.
          </p>
          <Link href="/pricing" className="btn-glow" style={{ background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '13px 32px', borderRadius: 8, display: 'inline-block' }}>
            Get the template →
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 960, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>GoverAgent</Link>
        <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>2025 · Built on Cloudflare Edge</span>
      </footer>
    </div>
  )
}
