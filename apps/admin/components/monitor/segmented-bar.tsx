import { chrome } from './colors'

type Segment = { label: string; value: number; color: string }

type SegmentedBarProps = {
  segments: Segment[]
}

export function SegmentedBar({ segments }: SegmentedBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1

  return (
    <div>
      <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', gap: '2px' }}>
        {segments.map((s) => (
          <div
            key={s.label}
            style={{
              width: `${Math.max((s.value / total) * 100, s.value > 0 ? 1 : 0)}%`,
              background: s.color,
              transition: 'width 200ms ease',
            }}
          />
        ))}
      </div>
      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ color: chrome.inkSecondary, flex: 1 }}>{s.label}</span>
            <span style={{ color: chrome.ink, fontWeight: 600 }}>
              {total > 0 ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
