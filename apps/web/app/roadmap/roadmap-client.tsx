'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

type Milestone = {
  id: string
  name: string
  goal: string
  status: string
}

type RoadmapData = {
  vision: string
  currentProgress: string
  nextSteps: string
  milestones: Milestone[]
}

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  COMPLETE: { color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
  IN_PROGRESS: { color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  APPROVED: { color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  PLANNING: { color: 'var(--text-faint)', bg: 'var(--surface-2)' },
  CANCELLED: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
}

export function RoadmapClient({ data }: { data: RoadmapData }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (!session?.data?.user) {
        router.push('/login')
        return
      }
      setAllowed(true)
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 14, color: 'var(--text-faint)' }}>Loading...</span>
      </div>
    )
  }

  if (!allowed) return null

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

      {/* Vision */}
      {data.vision && data.vision !== '[TBD]' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 28px', marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Vision</p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-muted)', margin: 0 }}>{data.vision}</p>
        </div>
      )}

      {/* Progress */}
      {data.currentProgress && data.currentProgress !== '[TBD]' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 28px', marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>ความคืบหน้าปัจจุบัน</p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)', margin: 0, whiteSpace: 'pre-line' }}>{data.currentProgress}</p>
        </div>
      )}

      {/* Milestones */}
      {data.milestones.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Milestones</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.milestones.map((m) => {
              const style = STATUS_STYLE[m.status] ?? STATUS_STYLE['PLANNING']
              return (
                <div key={m.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', minWidth: 48, fontFamily: 'monospace' }}>{m.id}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{m.name}</div>
                    {m.goal && m.goal !== 'TBD' && (
                      <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{m.goal}</div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: style.color, background: style.bg, padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                    {m.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {data.nextSteps && data.nextSteps !== '[TBD]' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 28px' }}>
          <p style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>ขั้นตอนถัดไป</p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)', margin: 0, whiteSpace: 'pre-line' }}>{data.nextSteps}</p>
        </div>
      )}

    </div>
  )
}
