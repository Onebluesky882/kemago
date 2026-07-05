type Props = {
  label: string
  value: string
  selected: boolean
  color?: string
  multi?: boolean
  onClick: (value: string) => void
}

export function OptionButton({ label, value, selected, color, multi = false, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      aria-pressed={selected}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '13px 16px',
        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        backgroundColor: selected ? 'var(--accent-dim)' : 'var(--surface)',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: selected ? 600 : 400,
        color: selected ? 'var(--accent)' : 'var(--text)',
        transition: 'border-color 150ms ease, background-color 150ms ease, transform 150ms ease',
        textAlign: 'left',
        width: '100%',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = 'var(--accent-line)' }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = 'var(--border)' }}
      onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-line)' }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'grid',
          placeItems: 'center',
          width: '18px',
          height: '18px',
          flexShrink: 0,
          borderRadius: multi ? '5px' : '999px',
          border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
          backgroundColor: selected ? 'var(--accent)' : 'transparent',
          color: '#fff',
          transition: 'all 150ms ease',
        }}
      >
        {selected && multi && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4.5 4.5L19.5 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {selected && !multi && (
          <span style={{ width: '8px', height: '8px', borderRadius: '999px', backgroundColor: '#fff' }} />
        )}
      </span>
      {color !== undefined && (
        <span
          style={{
            display: 'inline-block',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: color,
            border: '1px solid var(--border)',
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </button>
  )
}
