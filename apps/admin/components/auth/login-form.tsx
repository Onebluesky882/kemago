'use client'
import { useState } from 'react'

type Props = {
  onSubmit: (email: string, password: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function LoginForm({ onSubmit, isLoading, error }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [focused, setFocused] = useState<'email' | 'password' | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(email, password)
  }

  const inputStyle = (field: 'email' | 'password'): React.CSSProperties => ({
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${focused === field ? 'var(--accent)' : 'var(--border)'}`,
    background: 'var(--surface)',
    color: 'var(--text)',
    outline: 'none',
    boxShadow: focused === field ? '0 0 0 3px var(--accent-dim)' : 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  })

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sign in</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Monitor and manage your deployment</p>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(208, 59, 59, 0.10)',
            border: '1px solid rgba(208, 59, 59, 0.30)',
            color: 'var(--status-critical)',
            fontSize: '13px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="email" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          required
          style={inputStyle('email')}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="password" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
          required
          style={inputStyle('password')}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '4px',
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#ffffff',
          background: isLoading ? 'var(--accent)' : 'var(--accent)',
          opacity: isLoading ? 0.7 : 1,
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          cursor: isLoading ? 'default' : 'pointer',
          transition: 'background 150ms ease, transform 100ms ease',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) e.currentTarget.style.background = 'var(--accent-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--accent)'
        }}
        onMouseDown={(e) => {
          if (!isLoading) e.currentTarget.style.transform = 'scale(0.97)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {isLoading && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 0.8s linear infinite' }}>
            <path d="M12 2 A10 10 0 0 1 22 12" strokeLinecap="round" />
          </svg>
        )}
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  )
}
