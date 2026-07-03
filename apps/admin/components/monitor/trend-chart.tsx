'use client'
import { useState } from 'react'
import { chrome, sequential } from './colors'

type TrendPoint = { day: string; value: number }

type TrendChartProps = {
  data: TrendPoint[]
  formatValue?: (n: number) => string
  height?: number
}

export function TrendChart({ data, formatValue = (n) => n.toFixed(2), height = 220 }: TrendChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  if (data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: chrome.inkMuted, fontSize: '14px' }}>
        No data in this range yet
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.value), 0.01)

  return (
    <div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '6px',
          height: `${height}px`,
          borderBottom: `1px solid ${chrome.baseline}`,
          padding: '0 4px',
        }}
      >
        {/* hairline gridlines */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[0.25, 0.5, 0.75].map((f) => (
            <div
              key={f}
              style={{ position: 'absolute', left: 0, right: 0, bottom: `${f * (height - 8)}px`, borderTop: `1px solid ${chrome.gridline}` }}
            />
          ))}
        </div>

        {data.map((d, i) => {
          const barHeight = Math.max((d.value / max) * (height - 12), 2)
          const isHovered = hoverIdx === i
          return (
            <div
              key={d.day}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ flex: 1, maxWidth: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
            >
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: `${barHeight + 10}px`,
                    background: 'var(--tooltip-bg)',
                    color: 'var(--tooltip-text)',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  {formatValue(d.value)}
                </div>
              )}
              <div
                style={{
                  width: '100%',
                  height: `${barHeight}px`,
                  background: isHovered ? sequential[450] : sequential[400],
                  borderRadius: '4px 4px 0 0',
                  transition: 'background 150ms ease, height 200ms ease',
                }}
              />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '6px', padding: '8px 4px 0' }}>
        {data.map((d, i) => (
          <div key={d.day} style={{ flex: 1, maxWidth: '24px', textAlign: 'center', fontSize: '11px', color: chrome.inkMuted, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2) ? d.day.slice(5) : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
