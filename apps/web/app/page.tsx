'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease` }}>
      {children}
    </div>
  )
}

const SERVICES = [
  {
    emoji: '💳',
    title: 'รับชำระเงินออนไลน์',
    desc: 'บัตรเครดิต บัตรเดบิต ปลอดภัย ครบวงจร',
    tag: 'Payment',
    tagStyle: 'tag-pink',
  },
  {
    emoji: '🔐',
    title: 'ระบบยืนยันตัวตน',
    desc: 'สมัคร เข้าสู่ระบบ จัดการสิทธิ์ผู้ใช้ได้ทันที',
    tag: 'Security',
    tagStyle: 'tag-green',
  },
  {
    emoji: '💬',
    title: 'ชุมชนและกระดานถาม-ตอบ',
    desc: 'สร้างความสัมพันธ์กับลูกค้าของคุณ',
    tag: 'Community',
    tagStyle: 'tag-cream',
  },
  {
    emoji: '📊',
    title: 'แผงควบคุมธุรกิจ',
    desc: 'ดูภาพรวม จัดการผู้ใช้ และรายงานทั้งหมด',
    tag: 'Dashboard',
    tagStyle: 'tag-pink',
  },
  {
    emoji: '🗺️',
    title: 'แผนงานและ Roadmap',
    desc: 'ติดตาม milestone และความคืบหน้าโปรเจกต์',
    tag: 'Planning',
    tagStyle: 'tag-green',
  },
  {
    emoji: '✉️',
    title: 'อีเมลแจ้งเตือนอัตโนมัติ',
    desc: 'ส่งอีเมลทันทีเมื่อมีกิจกรรมสำคัญ',
    tag: 'Email',
    tagStyle: 'tag-cream',
  },
]

export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* Navbar */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1000,
        margin: '0 auto',
        background: 'rgba(253,250,247,0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌸</span>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>YourApp</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Link href="/roadmap" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', padding: '8px 14px', borderRadius: 8, fontWeight: 500 }}>Roadmap</Link>
          <Link href="/forum" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', padding: '8px 14px', borderRadius: 8, fontWeight: 500 }}>Forum</Link>
          <Link href="/dashboard" className="btn-glow" style={{ fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', padding: '9px 18px', borderRadius: 10, background: 'var(--accent)', boxShadow: '0 2px 12px rgba(232,100,122,0.25)' }}>
            เข้าสู่ระบบ →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6 }} />
        <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse at center, rgba(247,168,184,0.2) 0%, rgba(91,186,138,0.08) 50%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 660, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
          <div className="anim-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--pink-dim)', border: '1px solid rgba(232,100,122,0.2)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 28, letterSpacing: '0.02em' }}>
            <span style={{ fontSize: 14 }}>✨</span>
            Starter Template — พร้อมใช้งานทันที
          </div>

          <h1 className="anim-fade-up-1" style={{ fontSize: 'clamp(34px, 7vw, 60px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 20 }}>
            สร้างซอฟต์แวร์ของคุณ<br />
            <span className="shimmer-text">ได้ง่ายกว่าเดิม</span>
          </h1>

          <p className="anim-fade-up-2" style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 460, margin: '0 auto 40px' }}>
            ระบบพร้อมใช้ครบชุด ทั้ง payment, auth, forum และ dashboard<br />ไม่ต้องสร้างใหม่ตั้งแต่ต้น
          </p>

          <div className="anim-fade-up-3" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn-glow" style={{ background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '13px 28px', borderRadius: 12, display: 'inline-block', boxShadow: '0 4px 16px rgba(232,100,122,0.3)' }}>
              เริ่มต้นเลย →
            </Link>
            <Link href="/roadmap" style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '13px 28px', borderRadius: 12, display: 'inline-block', boxShadow: 'var(--shadow-sm)' }}>
              ดูแผนงาน 🗺️
            </Link>
          </div>

          <p className="anim-fade-up-4" style={{ marginTop: 32, fontSize: 12, color: 'var(--text-faint)' }}>
            🌿 ฟรีค่า hosting · 🔒 ปลอดภัย · ⚡ โหลดเร็ว
          </p>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: 800, margin: '0 auto', borderTop: '1px solid var(--border)' }} />

      {/* Services */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <FadeSection>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 12, color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              🎁 ระบบที่รวมไว้ให้แล้ว
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              ทุกอย่างที่ธุรกิจต้องการ<br />
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ในแพลตฟอร์มเดียว</span>
            </h2>
          </div>
        </FadeSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {SERVICES.map((s, i) => (
            <FadeSection key={s.title} delay={i * 0.07}>
              <div className="card-hover" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 24px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden', height: '100%' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'var(--pink-dim)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{s.emoji}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</p>
                  <span className={`tag ${s.tagStyle}`}>{s.tag}</span>
                </div>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: 800, margin: '0 auto', borderTop: '1px solid var(--border)' }} />

      {/* CTA */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(247,168,184,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <FadeSection>
        <div style={{ position: 'relative', maxWidth: 540, margin: '0 auto', padding: '88px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌸</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, lineHeight: 1.2 }}>
            พร้อมเริ่มต้นแล้วหรือยัง?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.7 }}>
            เข้าสู่ระบบเพื่อจัดการโปรเจกต์ของคุณ<br />หรือดูแผนงานความคืบหน้า
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn-glow" style={{ background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '13px 32px', borderRadius: 12, display: 'inline-block', boxShadow: '0 4px 16px rgba(232,100,122,0.3)' }}>
              Dashboard →
            </Link>
            <Link href="/roadmap" style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: 15, fontWeight: 600, textDecoration: 'none', padding: '13px 28px', borderRadius: 12, display: 'inline-block', boxShadow: 'var(--shadow-sm)' }}>
              Roadmap
            </Link>
          </div>
        </div>
        </FadeSection>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🌸</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>YourApp</span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>© 2025 · Made with love</span>
      </footer>

    </div>
  )
}
