type Props = {
  current: number
  total: number
}

export function ProgressBar({ current, total }: Props) {
  const percent = Math.min(100, Math.round((current / total) * 100))

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <span className="tag tag-accent" style={{ fontVariantNumeric: 'tabular-nums' }}>
          Step {current} of {total}
        </span>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {percent}%
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '5px',
          backgroundColor: 'var(--border)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: 'var(--accent)',
            borderRadius: '999px',
            transition: 'width 300ms ease',
          }}
        />
      </div>
    </div>
  )
}
