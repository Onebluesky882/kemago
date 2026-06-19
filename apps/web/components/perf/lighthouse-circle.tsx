'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  score: number
  label: string
  color: string
  delay?: number
}

export function LighthouseCircle({ score, label, color, delay = 0 }: Props) {
  const [animated, setAnimated] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const r = 36
  const circumference = 2 * Math.PI * r

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(() => setAnimated(score), delay)
          observer.disconnect()
          return () => clearTimeout(t)
        }
      },
      { threshold: 0.4 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [score, delay])

  const offset = circumference - (animated / 100) * circumference

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block', width: 88, height: 88, marginBottom: 12 }}>
        <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="44" cy="44" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle
            cx="44" cy="44" r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: animated > 0
                ? `stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
                : 'none',
            }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{
            fontSize: 20, fontWeight: 800, color,
            letterSpacing: '-0.03em',
            opacity: animated > 0 ? 1 : 0,
            transition: `opacity 0.4s ease ${delay + 300}ms`,
          }}>
            {score}
          </span>
        </div>
        <div style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          pointerEvents: 'none',
          opacity: animated > 0 ? 1 : 0,
          transition: `opacity 0.6s ease ${delay + 200}ms`,
        }} />
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.4 }}>{label}</p>
    </div>
  )
}
