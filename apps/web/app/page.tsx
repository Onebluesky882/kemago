import Link from 'next/link'
import { AnimatedBar } from '@/components/perf/animated-bar'
import { LighthouseCircle } from '@/components/perf/lighthouse-circle'

const ROLES = [
  'Product Manager', 'UI Designer', 'Frontend Developer',
  'Backend Developer', 'DevOps Engineer', 'QA Engineer',
]

const DELIVERABLES = [
  { label: 'Website', desc: 'Public-facing pages, SEO-ready' },
  { label: 'Admin Dashboard', desc: 'Full control panel for your business' },
  { label: 'Database', desc: 'Cloudflare D1 — serverless SQL' },
  { label: 'Authentication', desc: 'Login, register, session management' },
  { label: 'REST API', desc: 'Secure endpoints for every feature' },
  { label: 'AI Agent', desc: 'Conductor that builds and maintains your app' },
  { label: 'Deployment', desc: 'Live on Cloudflare Edge in minutes' },
]

const REASONS = [
  { n: '01', title: 'Own software without writing code', body: 'Describe your idea in plain language. The AI builds the entire system — frontend, backend, database, and deployment — automatically.' },
  { n: '02', title: 'No team to hire or manage', body: 'Replace six roles with one AI. No salaries, no onboarding, no meetings. Start building the moment you have an idea.' },
  { n: '03', title: 'Production-ready from day one', body: 'Every project ships with auth, database, storage, email, API, and a deploy pipeline. Not a prototype — a real system.' },
  { n: '04', title: 'AI maintains your project forever', body: 'Add features, change themes, support new languages, scale to millions of users — just describe what you want.' },
]

const COMPARE = [
  'Learn AI Coding', 'Learn Git & version control', 'Configure deployments',
  'Manage cloud infrastructure', 'Days or weeks to get started', 'Build AI workflow yourself',
]

const FEATURES = [
  {
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    label: 'Security built-in',
    desc: 'Auth, sessions, and HTTPS on every project',
  },
  {
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    label: 'AI Conductor',
    desc: 'Understands every role, every phase of your project',
  },
  {
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    label: 'Scalable by default',
    desc: 'Cloudflare Edge — handles millions of requests',
  },
  {
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    label: 'No coding required',
    desc: 'Chat to build, change, and maintain your software',
  },
]

type PerfRow = { label: string; value: number; max: number; color: string }
type PerfChart = { metric: string; desc: string; unit: string; rows: PerfRow[] }

const PERF_BARS: PerfChart[] = [
  {
    metric: 'Time to First Byte (TTFB)',
    desc: 'How fast the server responds',
    unit: 'ms',
    rows: [
      { label: 'WordPress (shared hosting)', value: 820, max: 1000, color: '#ef4444' },
      { label: 'WordPress (managed hosting)', value: 310, max: 1000, color: '#f97316' },
      { label: 'FullstackAgent (Cloudflare Edge)', value: 18, max: 1000, color: '#22c55e' },
    ],
  },
  {
    metric: 'First Contentful Paint (FCP)',
    desc: 'When users first see content',
    unit: 's',
    rows: [
      { label: 'WordPress (shared hosting)', value: 3.2, max: 4, color: '#ef4444' },
      { label: 'WordPress (managed hosting)', value: 1.6, max: 4, color: '#f97316' },
      { label: 'FullstackAgent (Cloudflare Edge)', value: 0.28, max: 4, color: '#22c55e' },
    ],
  },
  {
    metric: 'Largest Contentful Paint (LCP)',
    desc: 'When the main content is fully visible',
    unit: 's',
    rows: [
      { label: 'WordPress (shared hosting)', value: 5.8, max: 7, color: '#ef4444' },
      { label: 'WordPress (managed hosting)', value: 2.4, max: 7, color: '#f97316' },
      { label: 'FullstackAgent (Cloudflare Edge)', value: 0.55, max: 7, color: '#22c55e' },
    ],
  },
]

const LIGHTHOUSE = [
  { label: 'WordPress (shared)', score: 42, color: '#ef4444' },
  { label: 'WordPress (managed)', score: 68, color: '#f97316' },
  { label: 'FullstackAgent', score: 97, color: '#22c55e' },
]

const WP_COMPARE = [
  { label: 'Hosting cost', wp: '$10–50/month', us: 'Free', usGood: true },
  { label: 'Plugin fees', wp: '$5–200/month', us: 'Free', usGood: true },
  { label: 'Page load speed', wp: '2–6 seconds', us: '<100ms Edge', usGood: true },
  { label: 'Custom features', wp: 'Limited by plugins', us: 'Anything you describe', usGood: true },
  { label: 'Security patches', wp: 'Manual updates', us: 'Automatic', usGood: true },
  { label: 'Scale under traffic', wp: 'Crashes or upgrade plan', us: '300+ cities worldwide', usGood: true },
  { label: 'AI integration', wp: 'Plugin required ($$$)', us: 'Built-in from day one', usGood: true },
  { label: 'Full ownership', wp: 'Vendor lock-in', us: 'Your code, your server', usGood: true },
]

export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(12px)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>FullstackAgent</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/why" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>Why us</Link>
          <Link href="/pricing" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>Pricing</Link>
          <Link href="/contact" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>Consult Dev</Link>
          <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>Sign in</Link>
          <Link href="/setup" style={{ background: 'var(--text)', color: '#000', fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '6px 14px', borderRadius: 6 }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Dot grid */}
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />

        {/* Orb glow */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%',
          transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'orb-move 12s ease-in-out infinite',
        }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
          <div className="anim-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-dim)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 100, padding: '4px 12px', fontSize: 12, color: '#a78bfa', fontWeight: 500, marginBottom: 32, letterSpacing: '0.02em' }}>
            <span style={{ position: 'relative', display: 'inline-block', width: 6, height: 6 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#a78bfa', animation: 'pulse-ring 1.8s ease-out infinite' }} />
              <span style={{ position: 'relative', display: 'block', width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} />
            </span>
            AI Software Factory
          </div>

          <h1 className="anim-fade-up-1" style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 24 }}>
            Your private AI<br />
            <span className="shimmer-text">software company.</span>
          </h1>

          <p className="anim-fade-up-2" style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 40px' }}>
            Build production-ready software by chatting with AI.<br />No coding. No hiring. No setup.
          </p>

          <div className="anim-fade-up-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/setup" className="btn-glow" style={{ background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '12px 24px', borderRadius: 8, display: 'inline-block', transition: 'background 150ms' }}>Start building for free →</Link>
            <Link href="#why" style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: 15, fontWeight: 500, textDecoration: 'none', padding: '12px 24px', borderRadius: 8, display: 'inline-block' }}>See how it works</Link>
          </div>

          <p className="anim-fade-up-4" style={{ marginTop: 40, fontSize: 12, color: 'var(--text-faint)' }}>
            Deployed on Cloudflare Edge · Secured · Zero infrastructure to manage
          </p>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Replace team */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Replace your entire team</p>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2 }}>Instead of hiring six people,<br /><span style={{ color: 'var(--text-muted)' }}>you have one AI that does it all.</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {ROLES.map((role) => (
            <div key={role} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#a78bfa', flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{role}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* What you get */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Everything included</p>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2 }}>AI builds the full system.<br /><span style={{ color: 'var(--text-muted)' }}>Automatically.</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1, background: 'var(--border)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {DELIVERABLES.map((item) => (
            <div key={item.label} style={{ background: 'var(--surface)', padding: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'var(--accent-dim)', marginBottom: 12 }}>
                <span style={{ color: '#a78bfa', fontSize: 12 }}>◆</span>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.label}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Why us */}
      <section id="why" style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Why FullstackAgent</p>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2 }}>Not just a tool.<br /><span style={{ color: 'var(--text-muted)' }}>A software company that works for you.</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {REASONS.map((r) => (
            <div key={r.n} className="card-hover" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 16 }}>{r.n}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em', lineHeight: 1.3 }}>{r.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Comparison */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em' }}>Doing it yourself vs.<br /><span style={{ color: 'var(--accent)' }}>FullstackAgent</span></h2>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px', padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.05em' }}>TASK</span>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, textAlign: 'center', letterSpacing: '0.05em' }}>DIY</span>
            <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, textAlign: 'center', letterSpacing: '0.05em' }}>FULLSTACKAGENT</span>
          </div>
          {COMPARE.map((label, i) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px', padding: '14px 20px', borderBottom: i < COMPARE.length - 1 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
              <div style={{ textAlign: 'center' }}><span style={{ color: '#ef4444', fontSize: 16 }}>✕</span></div>
              <div style={{ textAlign: 'center' }}><span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', background: 'rgba(34,197,94,0.08)', padding: '3px 10px', borderRadius: 100 }}>Not needed</span></div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Feature strip */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, background: 'var(--border)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {FEATURES.map((f) => (
            <div key={f.label} style={{ background: 'var(--surface)', padding: '28px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                {f.svg}
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>{f.label}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Performance benchmark */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Performance benchmark</p>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 12 }}>
            The numbers don&apos;t lie.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
            Real-world measurements based on typical deployments. Cloudflare Edge serves from the nearest location to every visitor on Earth.
          </p>
        </div>

        {/* Lighthouse score circles */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '32px 24px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>Lighthouse Performance Score</h3>
              <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>0–100 · higher is better · measured at page load</p>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 100 }}>
              Simulated · based on real-world averages
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {LIGHTHOUSE.map((item, i) => (
              <LighthouseCircle
                key={item.label}
                score={item.score}
                label={item.label}
                color={item.color}
                delay={i * 150}
              />
            ))}
          </div>
        </div>

        {/* Bar charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PERF_BARS.map((chart) => (
            <div key={chart.metric} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600 }}>{chart.metric}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{chart.desc} · lower is better</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chart.rows.map((row, ri) => (
                  <AnimatedBar
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    max={row.max}
                    display={chart.unit === 'ms' ? `${row.value}ms` : `${row.value}s`}
                    color={row.color}
                    delay={ri * 120}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-faint)', marginTop: 20, lineHeight: 1.6 }}>
          Data based on GTmetrix, WebPageTest, and Cloudflare public benchmarks · Shared hosting: 1 vCPU / 1GB RAM ·
          Managed hosting: WP Engine Startup plan · FullstackAgent: Cloudflare Workers + Edge network
        </p>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* WordPress vs FullstackAgent */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Moving from WordPress?</p>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 16 }}>
            Free hosting. Free service.<br />
            <span style={{ color: 'var(--text-muted)' }}>Faster than WordPress. Forever.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            WordPress charges you monthly, loads slowly, and locks you into plugins you can&apos;t customize.
            FullstackAgent runs on Cloudflare Edge — free tier covers most small businesses, and you own every line of code.
          </p>
        </div>

        {/* Free tier highlight */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 40 }}>
          {[
            { value: '$0', label: 'Hosting cost to start', sub: 'Cloudflare free tier' },
            { value: '100ms', label: 'Average page load', sub: 'vs 2–6s on WordPress' },
            { value: '300+', label: 'Edge locations worldwide', sub: 'Global by default' },
            { value: '∞', label: 'Custom features', sub: 'No plugin limits' },
          ].map((stat) => (
            <div key={stat.value} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--accent)', marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 160px 160px',
            padding: '10px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.05em' }}>FEATURE</span>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, textAlign: 'center', letterSpacing: '0.05em' }}>WORDPRESS</span>
            <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, textAlign: 'center', letterSpacing: '0.05em' }}>FULLSTACKAGENT</span>
          </div>
          {WP_COMPARE.map((row, i) => (
            <div key={row.label} style={{
              display: 'grid', gridTemplateColumns: '1fr 160px 160px',
              padding: '13px 20px',
              borderBottom: i < WP_COMPARE.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.label}</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.06)', padding: '3px 8px', borderRadius: 6 }}>{row.wp}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--green)', background: 'rgba(34,197,94,0.08)', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>{row.us}</span>
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-faint)', marginTop: 16 }}>
          * Cloudflare Workers free tier: 100,000 requests/day · D1 database: 5GB free · R2 storage: 10GB free
        </p>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* CTA */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20 }}>
            Ready to build your<br /><span className="shimmer-text">software company?</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 36 }}>Tell the AI what you want. It handles everything else.</p>
          <Link href="/setup" className="btn-glow" style={{ background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none', padding: '14px 32px', borderRadius: 10, display: 'inline-block', letterSpacing: '-0.01em', transition: 'background 150ms, box-shadow 200ms' }}>
            Start for free →
          </Link>
          <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-faint)' }}>No credit card required · Deployed in minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 960, margin: '0 auto' }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>FullstackAgent</span>
        <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>© 2025 · Built on Cloudflare Edge</span>
      </footer>

    </div>
  )
}
