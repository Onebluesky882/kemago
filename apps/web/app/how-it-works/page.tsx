import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { BackButton } from '@/components/back-button'

const STEPS = [
  {
    n: '01',
    who: 'You',
    title: 'Tell us what your business does',
    body: 'No forms. No technical questions. Just describe your idea like you\'re explaining it to a friend. What do you sell? Who are your customers? What do you need the app to do?',
    tag: 'Takes 5 minutes',
  },
  {
    n: '02',
    who: 'Conductor AI',
    title: 'The system creates a plan',
    body: 'A Conductor AI reads your answers and breaks your entire project into a list of stages — login system, dashboard, payments, emails, storage — in the right order. You don\'t see the plan. You just see the result.',
    tag: 'Automatic',
  },
  {
    n: '03',
    who: 'Worker AIs',
    title: 'Specialists build each part',
    body: 'Each stage is handed to a Worker AI that knows only one thing — and knows it deeply. The login Worker only handles login. The payment Worker only handles payments. No one steps on each other\'s work.',
    tag: 'Runs in the background',
  },
  {
    n: '04',
    who: 'Quality Check',
    title: 'Nothing ships until it\'s verified',
    body: 'Before any part is marked done, it goes through an automatic check. The system tests what was built, makes sure it matches what was requested, and only then allows the next stage to begin. No skipping.',
    tag: 'Every stage',
  },
  {
    n: '05',
    who: 'You',
    title: 'You get a working app — live',
    body: 'Not a mockup. Not a prototype. A real application, deployed and accessible to anyone on the internet. You own it completely. The code, the server, the data — all yours.',
    tag: 'Ready to use',
  },
]

const ROLES = [
  {
    name: 'Conductor',
    role: 'Project Manager',
    desc: 'Reads your requirements, creates the plan, assigns work to each specialist, and checks that everything was done correctly before moving on.',
    color: '#7c3aed',
  },
  {
    name: 'Workers',
    role: 'Specialists',
    desc: 'Each Worker handles one job — and one job only. They cannot change scope, skip steps, or make decisions outside their assignment.',
    color: '#2563eb',
  },
  {
    name: 'Gate System',
    role: 'Quality Inspector',
    desc: 'An automated check that sits between every stage. If the work doesn\'t meet the standard, it goes back. Nothing moves forward until it passes.',
    color: '#059669',
  },
  {
    name: 'You',
    role: 'Owner',
    desc: 'You start the process, you approve the direction, and you own everything that gets built. The system works for you — not the other way around.',
    color: '#d97706',
  },
]

const GUARANTEES = [
  {
    icon: '↔',
    title: 'Each AI knows its limits',
    body: 'No Worker can go beyond its assigned job. The login AI cannot touch your payment system. The storage AI cannot change your UI. Boundaries are enforced automatically.',
  },
  {
    icon: '↺',
    title: 'Bad work gets rejected, not hidden',
    body: 'If a stage fails the quality check, it comes back with specific reasons. The Worker fixes it and submits again. You never receive broken software that "mostly works."',
  },
  {
    icon: '⊘',
    title: 'Nothing runs until you\'re ready',
    body: 'The entire system is locked until you activate it. No AI starts building anything without your explicit permission. You control when work begins.',
  },
  {
    icon: '◎',
    title: 'Every decision is recorded',
    body: 'Every stage, every check, every approval is written down automatically. You can always see what was built, when, and why — in plain language.',
  },
]

export default function HowItWorksPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 0' }}><BackButton /></div>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 70%)', pointerEvents: 'none', animation: 'orb-move 12s ease-in-out infinite' }} />

        <div style={{ position: 'relative', maxWidth: 660, margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
          <div className="anim-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-dim)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 100, padding: '4px 12px', fontSize: 12, color: '#a78bfa', fontWeight: 500, marginBottom: 32 }}>
            <span style={{ position: 'relative', display: 'inline-block', width: 6, height: 6 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#a78bfa', animation: 'pulse-ring 1.8s ease-out infinite' }} />
              <span style={{ position: 'relative', display: 'block', width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} />
            </span>
            How it works
          </div>

          <h1 className="anim-fade-up-1" style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 24 }}>
            A team of AIs.<br />
            <span className="shimmer-text">Working in order. For you.</span>
          </h1>

          <p className="anim-fade-up-2" style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
            GoverAgent isn&apos;t one AI answering questions.
            It&apos;s a structured system where each AI has a specific role,
            strict limits, and quality checks at every step.
          </p>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Steps */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>The process</p>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, letterSpacing: '-0.03em' }}>
            From your first message<br /><span style={{ color: 'var(--text-muted)' }}>to a live app</span>
          </h2>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 19, top: 32, bottom: 32, width: 1, background: 'var(--border)', display: 'none' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Step indicator */}
                <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: i === 0 || i === 4 ? 'var(--accent)' : 'var(--surface)', border: `1px solid ${i === 0 || i === 4 ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i === 0 || i === 4 ? '#fff' : 'var(--text-muted)' }}>
                  {step.n}
                </div>

                {/* Content */}
                <div className="card-hover" style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{step.who}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 100 }}>{step.tag}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Who does what */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>The team</p>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Who does what
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: 'var(--border)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {ROLES.map((r) => (
            <div key={r.name} style={{ background: 'var(--surface)', padding: '28px 24px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${r.color}18`, border: `1px solid ${r.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: r.color }}>{r.name[0]}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: r.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{r.role}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{r.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Guarantees */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Built-in protections</p>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, letterSpacing: '-0.03em' }}>
            What keeps the system honest
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {GUARANTEES.map((g) => (
            <div key={g.title} className="card-hover" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#a78bfa', marginBottom: 16 }}>
                {g.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>{g.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{g.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Simple analogy */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 36px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>The simple version</p>
          <p style={{ fontSize: 'clamp(16px, 3vw, 22px)', lineHeight: 1.7, color: 'var(--text)', fontWeight: 500, marginBottom: 0 }}>
            Think of it like hiring a construction company.
            You tell them what you want to build.
            They send the right crew for each job.
            An inspector checks every stage before the next one starts.
            <span style={{ color: 'var(--text-muted)' }}> You just move in when it&apos;s done.</span>
          </p>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* CTA */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20 }}>
            Ready to see it<br /><span className="shimmer-text">build your app?</span>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 36 }}>Tell us what you need. The system handles everything else.</p>
          <Link href="/setup" className="btn-glow" style={{ background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none', padding: '14px 32px', borderRadius: 10, display: 'inline-block', letterSpacing: '-0.01em' }}>
            Start building →
          </Link>
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-faint)' }}>No credit card · No setup · Live in minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 960, margin: '0 auto' }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>GoverAgent</span>
        <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>© 2025 · Built on Cloudflare Edge</span>
      </footer>

    </div>
  )
}
