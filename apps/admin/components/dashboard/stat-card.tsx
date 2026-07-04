import { Sparkline } from '../monitor/sparkline'
import { chrome, status as statusColors } from '../monitor/colors'

type StatCardProps = {
  label: string
  value: string
  status?: 'ok' | 'error'
  delta?: { text: string; positive: boolean }
  trend?: number[]
}

export function StatCard({ label, value, status, delta, trend }: StatCardProps) {
  return (
    <div
      style={{
        background: chrome.surface,
        border: `1px solid ${chrome.gridline}`,
        borderRadius: '8px',
        padding: '20px',
        transition: 'border-color 150ms ease, transform 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = chrome.border
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = chrome.gridline
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: chrome.inkSecondary,
          fontSize: '14px',
          marginBottom: '8px',
        }}
      >
        {status !== undefined && (
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: status === 'ok' ? statusColors.good : statusColors.critical,
              flexShrink: 0,
            }}
          />
        )}
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: chrome.ink }}>{value}</div>
          {delta && (
            <div style={{ fontSize: '12px', marginTop: '4px', color: delta.positive ? 'var(--delta-good-text)' : statusColors.critical }}>
              {delta.positive ? '↑' : '↓'} {delta.text}
            </div>
          )}
        </div>
        {trend && trend.length > 1 && <Sparkline values={trend} />}
      </div>
    </div>
  )
}
