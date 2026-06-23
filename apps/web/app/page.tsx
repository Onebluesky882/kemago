import Link from 'next/link'

const SERVICES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    title: 'ระบบรับชำระเงินออนไลน์',
    desc: 'รองรับบัตรเครดิต บัตรเดบิต และช่องทางการชำระเงินหลากหลาย ปลอดภัย ครบวงจร',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'ระบบยืนยันตัวตนและความปลอดภัย',
    desc: 'สมัครสมาชิก เข้าสู่ระบบ จัดการสิทธิ์ผู้ใช้ พร้อมการป้องกันความปลอดภัยระดับสูง',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'ระบบชุมชนและการสื่อสาร',
    desc: 'กระดานสนทนา แจ้งปัญหา ตอบคำถาม สร้างความสัมพันธ์กับลูกค้าของคุณ',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    title: 'แผงควบคุมสำหรับผู้ดูแล',
    desc: 'ดูภาพรวมธุรกิจ จัดการผู้ใช้ ดูรายงาน และควบคุมทุกอย่างในที่เดียว',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: 'แผนงานและ Roadmap โปรเจกต์',
    desc: 'ติดตามความคืบหน้า เป้าหมาย และ milestone ของโปรเจกต์ได้ง่ายๆ ในทุกขั้นตอน',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: 'ระบบอีเมลแจ้งเตือน',
    desc: 'ส่งอีเมลอัตโนมัติเมื่อมีกิจกรรมสำคัญ เช่น การชำระเงิน การสมัครสมาชิก และการแจ้งเตือนต่างๆ',
  },
]

export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 960, margin: '0 auto' }}>
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em' }}>YourApp</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/roadmap" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', padding: '8px 14px', borderRadius: 8 }}>Roadmap</Link>
          <Link href="/forum" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', padding: '8px 14px', borderRadius: 8 }}>Forum</Link>
          <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, background: 'var(--accent)' }}>Dashboard</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, fontWeight: 600 }}>Your Project Name</p>
          <h1 style={{ fontSize: 'clamp(32px, 7vw, 56px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 20 }}>
            ระบบซอฟต์แวร์สำหรับ<br />
            <span className="shimmer-text">ธุรกิจของคุณ</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 440, margin: '0 auto 40px' }}>
            ครบทุกระบบที่ธุรกิจต้องการ พร้อมใช้งานทันที ไม่ต้องสร้างใหม่ตั้งแต่ต้น
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn-glow" style={{ background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '13px 28px', borderRadius: 8, display: 'inline-block' }}>
              เข้าสู่ระบบ →
            </Link>
            <Link href="/roadmap" style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: 15, fontWeight: 500, textDecoration: 'none', padding: '13px 28px', borderRadius: 8, display: 'inline-block' }}>
              ดูแผนงาน
            </Link>
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Services */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>ระบบที่รวมไว้ให้แล้ว</p>
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            ทุกอย่างที่ธุรกิจต้องการ<br />
            <span style={{ color: 'var(--text-muted)' }}>ในแพลตฟอร์มเดียว</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {SERVICES.map((s) => (
            <div key={s.title} className="card-hover" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 24px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', marginBottom: 16 }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* CTA */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14 }}>พร้อมเริ่มต้นแล้วหรือยัง?</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
            เข้าสู่ระบบเพื่อจัดการโปรเจกต์ของคุณ หรือดูแผนงานความคืบหน้า
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn-glow" style={{ background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '13px 32px', borderRadius: 8, display: 'inline-block' }}>
              Dashboard →
            </Link>
            <Link href="/roadmap" style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: 15, fontWeight: 500, textDecoration: 'none', padding: '13px 28px', borderRadius: 8, display: 'inline-block' }}>
              Roadmap
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 960, margin: '0 auto' }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>YourApp</span>
        <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>© 2025</span>
      </footer>

    </div>
  )
}
