'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  label: string
  value: number
  max: number
  display: string
  color: string
  delay?: number
}

export function AnimatedBar({ label, value, max, display, color, delay = 0 }: Props) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(() => setWidth((value / max) * 100), delay)
          observer.disconnect()
          return () => clearTimeout(t)
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, max, delay])

  return (
    <div ref={ref}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 48, textAlign: 'right' }}>{display}</span>
      </div>
      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${width}%`,
          background: color,
          borderRadius: 3,
          opacity: color === '#22c55e' ? 1 : 0.7,
          transition: width > 0 ? `width 1s cubic-bezier(0.16,1,0.3,1)` : 'none',
        }} />
      </div>
    </div>
  )
}
