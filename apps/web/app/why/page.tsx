import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { BackButton } from '@/components/back-button'

const SCENARIOS = [
  {
    situation: 'You need a login system for your app.',
    claude: 'It writes you some code. You copy it somewhere. Something breaks. You ask again. It writes different code. An hour later you have three different login systems and none of them work.',
    fsa: 'Login is already built, connected to your database, and live. It just works.',
  },
  {
    situation: 'You want to add a new feature next week.',
    claude: 'You start a new chat. Claude has no idea what your project is, what you\'ve built, or what decisions you\'ve made. You spend 20 minutes re-explaining before getting anywhere.',
    fsa: 'It already knows your entire project. Every decision, every feature, every file. You just say what you want next.',
  },
  {
    situation: 'Something breaks in production.',
    claude: 'You paste the error. It suggests a fix. You apply it. Something else breaks. You\'re debugging in circles with no idea what\'s actually going on.',
    fsa: 'It knows the whole system. It knows what changed, what depends on what, and how to fix it without breaking everything else.',
  },
  {
    situation: 'You want to launch in two weeks.',
    claude: 'It can help you write code. But you still need to figure out hosting, deployment, databases, domains, security, and everything else — on your own.',
    fsa: 'The app is already deployed. Security is already set up. Database is already running. Two weeks was more than enough.',
  },
]

const TRUTHS = [
  {
    n: '01',
    heading: 'Claude gives you ingredients. We serve you the meal.',
    body: 'Asking Claude to build your product is like asking a chef to read you a recipe instead of cooking for you. You still have to do everything yourself.',
  },
  {
    n: '02',
    heading: 'Claude forgets you the moment you close the tab.',
    body: 'Every conversation starts from zero. No memory of what you\'ve built, what problems you\'ve solved, or what direction you\'re going. GoverAgent remembers everything.',
  },
  {
    n: '03',
    heading: 'Claude answers questions. We make decisions.',
    body: 'Claude tells you your options. We pick the right one, build it, test it, deploy it, and move on to the next thing. No endless back-and-forth.',
  },
  {
    n: '04',
    heading: 'Claude helps you build. We build for you.',
    body: 'There\'s a difference between a tool that assists a developer and a system that replaces the need for one. This is the second thing.',
  },
]

const COMPARE_ROWS = [
  { label: 'Remembers your project', claude: false, fsa: true },
  { label: 'Knows what to do next', claude: false, fsa: true },
  { label: 'Deploys your app', claude: false, fsa: true },
  { label: 'Makes decisions for you', claude: false, fsa: true },
  { label: 'Works while you sleep', claude: false, fsa: true },
  { label: 'Produces running software', claude: false, fsa: true },
  { label: 'Answers questions', claude: true, fsa: true },
  { label: 'Writes code', claude: true, fsa: true },
]

export default function WhyPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 0' }}><BackButton /></div>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 70%)', pointerEvents: 'none', animation: 'orb-move 12s ease-in-out infinite' }} />

        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
          <div className="anim-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-dim)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 100, padding: '4px 12px', fontSize: 12, color: '#a78bfa', fontWeight: 500, marginBottom: 32, letterSpacing: '0.02em' }}>
            Honest comparison
          </div>

          <h1 className="anim-fade-up-1" style={{ fontSize: 'clamp(32px, 7vw, 58px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 24 }}>
            Claude is great.<br />
            <span className="shimmer-text">But it won&apos;t build your business.</span>
          </h1>

          <p className="anim-fade-up-2" style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
            Claude is a brilliant assistant. GoverAgent is a system that ships software.
            They solve completely different problems.
          </p>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Real scenarios */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Real situations</p>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            What actually happens<br /><span style={{ color: 'var(--text-muted)' }}>when you use Claude vs GoverAgent</span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--border)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--surface-2)' }}>
            <div style={{ padding: '14px 24px', borderRight: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.08em' }}>WITH CLAUDE</span>
            </div>
            <div style={{ padding: '14px 24px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.08em' }}>WITH GOVERAGENT</span>
            </div>
          </div>

          {SCENARIOS.map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)' }}>
              {/* Situation */}
              <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-2)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic' }}>"{s.situation}"</span>
              </div>
              {/* Comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ padding: '20px 24px', borderRight: '1px solid var(--border-subtle)' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{s.claude}</p>
                </div>
                <div style={{ padding: '20px 24px', borderLeft: '1px solid rgba(124,58,237,0.12)', background: 'rgba(124,58,237,0.03)' }}>
                  <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>{s.fsa}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Hard truths */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>The honest difference</p>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Four things nobody tells you<br /><span style={{ color: 'var(--text-muted)' }}>about using Claude to build software</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {TRUTHS.map((t) => (
            <div key={t.n} className="card-hover" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 16 }}>{t.n}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.02em', lineHeight: 1.3 }}>{t.heading}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Feature comparison table */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Side by side
          </h2>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 160px', padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.05em' }}></span>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, textAlign: 'center', letterSpacing: '0.05em' }}>CLAUDE</span>
            <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, textAlign: 'center', letterSpacing: '0.05em' }}>GOVERAGENT</span>
          </div>

          {COMPARE_ROWS.map((row, i) => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 160px', padding: '13px 20px', borderBottom: i < COMPARE_ROWS.length - 1 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.label}</span>
              <div style={{ textAlign: 'center' }}>
                {row.claude
                  ? <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', background: 'rgba(34,197,94,0.08)', padding: '3px 10px', borderRadius: 100 }}>Yes</span>
                  : <span style={{ color: '#555', fontSize: 16 }}>—</span>
                }
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', background: 'rgba(34,197,94,0.08)', padding: '3px 10px', borderRadius: 100 }}>Yes</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Closing statement */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--text-faint)', marginBottom: 24, letterSpacing: '0.02em' }}>The bottom line</p>
        <h2 style={{ fontSize: 'clamp(22px, 5vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 24 }}>
          Use Claude when you have a question.<br />
          <span style={{ color: 'var(--accent)' }}>Use GoverAgent when you have a business.</span>
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 48, maxWidth: 480, margin: '0 auto 48px' }}>
          Claude is an incredible tool. It&apos;s in our product too. But a tool isn&apos;t the same as a system.
          GoverAgent is the system that takes what you want and turns it into software that runs.
        </p>
        <Link href="/setup" className="btn-glow" style={{ background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none', padding: '14px 32px', borderRadius: 10, display: 'inline-block', letterSpacing: '-0.01em' }}>
          Start building →
        </Link>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-faint)' }}>No credit card required</p>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 960, margin: '0 auto' }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>GoverAgent</span>
        <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>© 2025 · Built on Cloudflare Edge</span>
      </footer>

    </div>
  )
}
