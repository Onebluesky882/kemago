import { Sparkline } from '../monitor/sparkline'

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
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        transition: 'border-color 150ms ease, transform 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#94a3b8'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748b',
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
              background: status === 'ok' ? '#16a34a' : '#dc2626',
              flexShrink: 0,
            }}
          />
        )}
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{value}</div>
          {delta && (
            <div style={{ fontSize: '12px', marginTop: '4px', color: delta.positive ? '#006300' : '#dc2626' }}>
              {delta.positive ? '↑' : '↓'} {delta.text}
            </div>
          )}
        </div>
        {trend && trend.length > 1 && <Sparkline values={trend} />}
      </div>
    </div>
  )
}
