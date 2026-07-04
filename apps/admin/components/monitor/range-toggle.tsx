import { chrome } from './colors'

type RangeToggleProps = {
  value: number
  onChange: (days: number) => void
  options?: number[]
}

export function RangeToggle({ value, onChange, options = [7, 30, 90] }: RangeToggleProps) {
  return (
    <div style={{ display: 'flex', gap: '4px', background: chrome.page, border: `1px solid ${chrome.gridline}`, borderRadius: '6px', padding: '2px' }}>
      {options.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          style={{
            padding: '5px 12px',
            fontSize: '13px',
            fontWeight: value === d ? 600 : 400,
            color: value === d ? chrome.ink : chrome.inkMuted,
            background: value === d ? chrome.surface : 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {d}d
        </button>
      ))}
    </div>
  )
}
