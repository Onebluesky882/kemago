import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { BackButton } from '@/components/back-button'

export const metadata = {
  title: 'Pricing — GoverAgent',
  description: 'Simple, transparent pricing. One AI software company — pick the plan that fits.',
}

const PLANS = [
  {
    name: 'Starter',
    price: 49,
    projects: 1,
    isPro: false,
    paymentLink: 'https://buy.stripe.com/test_9B6cMYflVd3r2Rf8nF8Zq00',
    features: [
      '1 active project',
      'Full-stack app (web + admin + API)',
      'Auth, database, storage included',
      'Deployed on Cloudflare Edge',
      'AI Conductor — unlimited chat',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: 119,
    projects: 3,
    isPro: true,
    paymentLink: 'https://buy.stripe.com/test_5kQeV6a1Be7v8bzcDV8Zq01',
    features: [
      '3 active projects',
      'Everything in Starter',
      'Priority AI Conductor',
      'Custom domain setup',
      'Email notification system (Resend)',
      'R2 file storage per project',
      'Priority support',
    ],
  },
  {
    name: 'Business',
    price: 299,
    projects: 10,
    isPro: false,
    paymentLink: 'https://buy.stripe.com/test_00weV6a1Bd3rajH6fx8Zq02',
    features: [
      '10 active projects',
      'Everything in Pro',
      'Dedicated Conductor agent',
      'Multi-language support',
      'Advanced CRUD features',
      'Performance optimization',
      'Developer consultation (1hr/month)',
    ],
  },
]

const COMPARE_ROWS = [
  { label: 'Active projects', values: ['1', '3', '10'] },
  { label: 'Price', values: ['$49', '$119', '$299'] },
  { label: 'Web + Admin + API', values: ['yes', 'yes', 'yes'] },
  { label: 'Auth + Database + Storage', values: ['yes', 'yes', 'yes'] },
  { label: 'AI Conductor (unlimited)', values: ['yes', 'yes', 'yes'] },
  { label: 'Email notifications', values: ['no', 'yes', 'yes'] },
  { label: 'Custom domain setup', values: ['no', 'yes', 'yes'] },
  { label: 'Priority Conductor', values: ['no', 'yes', 'yes'] },
  { label: 'Dev consultation (1hr/mo)', values: ['no', 'no', 'yes'] },
  { label: 'Dedicated agent', values: ['no', 'no', 'yes'] },
]

const FAQ = [
  {
    q: 'What is a project?',
    a: 'One project = one full-stack application. It includes a public website, admin dashboard, database, authentication, API, and deployment — everything you need to run a real product.',
  },
  {
    q: 'Can I delete a project and create a new one?',
    a: 'Each plan gives you a fixed number of active projects. Starter = 1 active project at a time. If you want a different project, upgrade or purchase a new plan.',
  },
  {
    q: 'How long does a project last?',
    a: 'Forever. Once your project is built and deployed, it runs on Cloudflare with no expiry date. Your plan covers the build and AI time — not a monthly hosting fee.',
  },
  {
    q: 'Is there a limit on AI Conductor usage?',
    a: 'No hard limit on conversations. Chat with the AI Conductor as much as you need to build and maintain your project.',
  },
  {
    q: 'Do I need to know how to code?',
    a: 'No. You describe what you want in plain language. The AI Conductor handles all technical work — building, deploying, and maintaining your app.',
  },
  {
    q: 'Is hosting really free?',
    a: 'Yes. Your app runs on Cloudflare free tier — 100,000 requests/day, 5GB database, 10GB file storage. Most small businesses never exceed this.',
  },
  {
    q: 'Can I add features later?',
    a: 'Yes, anytime. Tell the AI Conductor what you want to add. It builds and deploys the update for you — no extra charge per feature.',
  },
  {
    q: 'What if I need more help?',
    a: 'Book a 1-hour developer consultation at $100/hr. A real developer will help with anything beyond what AI can handle.',
  },
]

export default function PricingPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 0' }}><BackButton /></div>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto', padding: '72px 24px 64px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Pricing</p>
          <h1 style={{ fontSize: 'clamp(32px, 7vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
            Simple pricing.<br /><span className="shimmer-text">No surprises.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
            One-time payment. No monthly fees. Your app runs on Cloudflare free tier — forever.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {PLANS.map((plan) => (
            <div key={plan.name} className="card-hover" style={{ background: 'var(--surface)', border: plan.isPro ? '1px solid rgba(124,58,237,0.5)' : '1px solid var(--border)', borderRadius: 14, padding: '28px', position: 'relative', boxShadow: plan.isPro ? '0 0 40px rgba(124,58,237,0.08)' : 'none' }}>
              {plan.isPro && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 100, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: plan.isPro ? '#a78bfa' : 'var(--text)' }}>{plan.name}</h2>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em' }}>${plan.price}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>one-time</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', background: plan.isPro ? 'var(--accent-dim)' : 'var(--surface-2)', border: plan.isPro ? '1px solid rgba(124,58,237,0.2)' : '1px solid var(--border)', borderRadius: 100, padding: '3px 10px' }}>
                  <span style={{ fontSize: 12, color: plan.isPro ? '#a78bfa' : 'var(--text-muted)', fontWeight: 600 }}>
                    {plan.projects} {plan.projects === 1 ? 'project' : 'projects'}
                  </span>
                </div>
              </div>
              <a href={plan.paymentLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', background: plan.isPro ? 'var(--accent)' : 'var(--surface-2)', color: plan.isPro ? '#fff' : 'var(--text)', border: plan.isPro ? 'none' : '1px solid var(--border)', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600, textDecoration: 'none', marginBottom: 24, transition: 'background 150ms' }}>
                Buy now
              </a>
              <div style={{ borderTop: '1px solid var(--border-subtle)', marginBottom: 20 }} />
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    <span style={{ color: '#22c55e', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16 }}>☁️</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Free hosting included.</strong>{' '}
            Cloudflare free tier: 100,000 req/day · 5GB database · 10GB storage · no monthly fees.
          </span>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Compare */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 700, letterSpacing: '-0.03em' }}>Compare plans</h2>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <span />
            {PLANS.map((p) => (
              <span key={p.name} style={{ fontSize: 12, fontWeight: 700, textAlign: 'center', color: p.isPro ? '#a78bfa' : 'var(--text-muted)' }}>{p.name}</span>
            ))}
          </div>
          {COMPARE_ROWS.map((row, i) => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px', padding: '13px 20px', borderBottom: i < COMPARE_ROWS.length - 1 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.label}</span>
              {row.values.map((v, vi) => (
                <span key={vi} style={{ textAlign: 'center', fontSize: 13, fontWeight: v === 'yes' ? 600 : 400, color: v === 'yes' ? '#22c55e' : v === 'no' ? 'var(--text-faint)' : 'var(--text)' }}>
                  {v === 'yes' ? '✓' : v === 'no' ? '—' : v}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* FAQ */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 700, letterSpacing: '-0.03em' }}>Common questions</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {FAQ.map((item) => (
            <div key={item.q} style={{ background: 'var(--surface)', padding: '20px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{item.q}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* CTA */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14 }}>Not sure which plan?</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>Start with Starter — upgrade anytime. Or talk to a developer first.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/pricing" className="btn-glow" style={{ background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '12px 28px', borderRadius: 8, display: 'inline-block', transition: 'box-shadow 200ms' }}>Start with Starter</Link>
            <Link href="/contact" style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: 15, fontWeight: 500, textDecoration: 'none', padding: '12px 28px', borderRadius: 8, display: 'inline-block' }}>Talk to a developer</Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 960, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>GoverAgent</Link>
        <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>2025 · Built on Cloudflare Edge</span>
      </footer>

    </div>
  )
}
