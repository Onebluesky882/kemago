'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BackButton } from '@/components/back-button'

type State = 'idle' | 'loading' | 'success' | 'error'
type InviteResult = { invitesRemaining: number; username: string }

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://fullstack-builder-api.onebluesky882.workers.dev'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') ?? ''

  const [username, setUsername] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return
    setState('loading')
    try {
      const res = await fetch(`${API}/api/payment/github-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, githubUsername: username.trim() }),
      })
      const data = await res.json() as { success?: boolean; message?: string; error?: string; invitesRemaining?: number }
      if (res.ok && data.success) {
        setInviteResult({ invitesRemaining: data.invitesRemaining ?? 0, username: username.trim() })
        setState('success')
      } else {
        setErrorMsg(data.error ?? 'Something went wrong')
        setState('error')
      }
    } catch {
      setErrorMsg('Network error — please try again')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 24 }}>✓</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>You're in.</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: inviteResult && inviteResult.invitesRemaining > 0 ? 16 : 32 }}>
            GitHub invitation sent to <strong style={{ color: 'var(--text)' }}>{inviteResult?.username ?? username}</strong>.<br />
            Check your email to accept the invite, then clone the repo.
          </p>
          {inviteResult && inviteResult.invitesRemaining > 0 && (
            <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 32, fontSize: 13, color: 'var(--text-muted)' }}>
              You have <strong style={{ color: '#a78bfa' }}>{inviteResult.invitesRemaining} invite{inviteResult.invitesRemaining > 1 ? 's' : ''} remaining</strong> — go back to invite more GitHub accounts.
            </div>
          )}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', textAlign: 'left', marginBottom: 32 }}>
            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Next steps</p>
            {[
              'Accept the GitHub invitation in your email',
              'Clone the goveragent-template repo',
              'Follow setup instructions in CLAUDE.md',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
          <BackButton href="/" />
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: 440, width: '100%' }}>

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>Payment confirmed</p>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 12 }}>
            One last step.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Enter your GitHub username to get access to the private template repo.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>
              GitHub username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setState('idle') }}
              placeholder="e.g. yourname"
              autoFocus
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: state === 'error' ? '1px solid rgba(239,68,68,0.5)' : '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 15,
                color: 'var(--text)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms',
              }}
            />
            {state === 'error' && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{errorMsg}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={state === 'loading' || !username.trim()}
            style={{
              width: '100%',
              background: state === 'loading' ? 'var(--accent-dim)' : 'var(--accent)',
              color: state === 'loading' ? 'var(--text-muted)' : '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '13px',
              fontSize: 15,
              fontWeight: 700,
              cursor: state === 'loading' ? 'not-allowed' : 'pointer',
              transition: 'background 150ms',
            }}
          >
            {state === 'loading' ? 'Sending invite…' : 'Get access →'}
          </button>
        </form>

        <div style={{ marginTop: 28, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>How to find your GitHub username</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { step: '1', text: 'Go to github.com and sign in' },
              { step: '2', text: 'Click your profile photo (top right)' },
              { step: '3', text: 'Your username appears below your name — it starts without @' },
            ].map(({ step, text }) => (
              <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', minWidth: 16 }}>{step}.</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 6, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
            github.com/<span style={{ color: 'var(--text)' }}>yourname</span>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 20, lineHeight: 1.6 }}>
          Questions?{' '}
          <a href="mailto:wansing05@gmail.com" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            wansing05@gmail.com
          </a>
        </p>

      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ background: 'var(--bg)', minHeight: '100vh' }} />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
