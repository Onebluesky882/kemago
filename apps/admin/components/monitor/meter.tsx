import { chrome, status } from './colors'

type MeterProps = {
  value: number // 0..1
  size?: number
  label?: string
}

export function Meter({ value, size = 160, label }: MeterProps) {
  const pct = Math.max(0, Math.min(1, value))
  const color = pct >= 0.95 ? status.good : pct >= 0.8 ? status.warning : status.critical
  const radius = size / 2 - 12
  const circumference = Math.PI * radius
  const dash = circumference * pct
  const cy = size / 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size / 2 + 8 }}>
        <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
          <path
            d={`M 12 ${cy} A ${radius} ${radius} 0 0 1 ${size - 12} ${cy}`}
            fill="none"
            stroke={chrome.gridline}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d={`M 12 ${cy} A ${radius} ${radius} 0 0 1 ${size - 12} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: 'stroke-dasharray 300ms ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: 700, color: chrome.ink }}>{Math.round(pct * 100)}%</div>
        </div>
      </div>
      {label && <div style={{ marginTop: '4px', fontSize: '13px', color: chrome.inkSecondary, textAlign: 'center' }}>{label}</div>}
    </div>
  )
}
