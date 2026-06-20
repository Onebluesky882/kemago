import Link from 'next/link'

export const metadata = {
  title: 'Talk to a Developer — GoverAgent',
  description: 'Get expert guidance. Scale faster. $100/hr developer consultation.',
}

const SERVICES = [
  { title: 'Architecture Review', desc: 'Review your system design, identify bottlenecks, and plan for scale.' },
  { title: 'Custom Feature Build', desc: 'Need something the AI can\'t handle alone? A developer jumps in.' },
  { title: 'Performance Optimization', desc: 'Speed up your app, reduce costs, and handle more users.' },
  { title: 'Security Audit', desc: 'Full security review of your codebase, auth, and infrastructure.' },
  { title: 'Migration & Integration', desc: 'Move from WordPress or connect third-party services.' },
  { title: 'Scaling Strategy', desc: 'Plan for 10x, 100x, or 1000x your current traffic.' },
]

export default function ContactPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(12px)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--text)', textDecoration: 'none' }}>GoverAgent</Link>
        <Link href="/setup" style={{ background: 'var(--text)', color: '#000', fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '6px 14px', borderRadius: 6 }}>Get started</Link>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 100, padding: '4px 12px', fontSize: 12, color: 'var(--green)', fontWeight: 500, marginBottom: 28, letterSpacing: '0.02em' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          Available for consultation
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 7vw, 56px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 20 }}>
          Talk to a developer.<br /><span style={{ color: 'var(--text-muted)' }}>Scale without limits.</span>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
          When you need more than AI — a real developer is available to consult, build, and guide your project to the next level.
        </p>
        <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 32 }}>
          $100 <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--text-muted)' }}>/ hour</span>
        </p>
        <a href="mailto:wansing05@gmail.com?subject=Developer%20Consultation%20Request" style={{ background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '12px 28px', borderRadius: 8, display: 'inline-block', letterSpacing: '-0.01em' }}>
          Book a session →
        </a>
        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-faint)' }}>Reply within 24 hours · Sessions via Google Meet or Zoom</p>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Services */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>What you can get help with</p>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 700, letterSpacing: '-0.03em' }}>Expert guidance on anything.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {SERVICES.map((s) => (
            <div key={s.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '22px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* CTA */}
      <section style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 16 }}>Ready to talk?</h2>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          Send an email describing what you need. A developer will reply within 24 hours with availability and next steps.
        </p>
        <a href="mailto:wansing05@gmail.com?subject=Developer%20Consultation%20Request" style={{ background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '12px 28px', borderRadius: 8, display: 'inline-block' }}>
          Email a developer →
        </a>
        <p style={{ marginTop: 14, fontSize: 13, color: 'var(--text-faint)' }}>wansing05@gmail.com</p>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 960, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>GoverAgent</Link>
        <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>© 2025 · Built on Cloudflare Edge</span>
      </footer>

    </div>
  )
}
