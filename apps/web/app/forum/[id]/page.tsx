'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://fullstack-builder-api.onebluesky882.workers.dev'

type Reply = { id: string; body: string; createdAt: string; user: { id: string; name: string } }
type Post = { id: string; title: string; body: string; createdAt: string; user: { id: string; name: string }; forumReplies: Reply[] }

function Avatar({ name }: { name: string }) {
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>
      {name[0].toUpperCase()}
    </div>
  )
}

export default function ForumPostPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [body, setBody] = useState('')
  const [replying, setReplying] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch(`${API}/api/forum/${id}`, { credentials: 'include' })
    if (res.ok) setPost(await res.json())
  }

  useEffect(() => { if (id) load() }, [id])

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setReplying(true)
    setError('')
    const res = await fetch(`${API}/api/forum/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ body }),
    })
    if (res.ok) {
      setBody('')
      load()
    } else {
      const d = await res.json() as { error?: string }
      setError(d.error === 'Unauthorized' ? 'Please sign in to reply.' : (d.error ?? 'Failed'))
    }
    setReplying(false)
  }

  if (!post) return <div style={{ background: 'var(--bg)', minHeight: '100vh' }} />

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(12px)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/forum" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>← Forum</Link>
        <Link href="/" style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--text)', textDecoration: 'none', marginLeft: 'auto' }}>GoverAgent</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {/* Post */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.3, marginBottom: 16 }}>{post.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Avatar name={post.user.name} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{post.user.name}</span>
            <span style={{ fontSize: 12, color: 'var(--text-faint)', marginLeft: 4 }}>
              {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{post.body}</p>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', marginBottom: 32 }} />

        {/* Replies */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
            {post.forumReplies.length} {post.forumReplies.length === 1 ? 'reply' : 'replies'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {post.forumReplies.map((reply) => (
              <div key={reply.id} style={{ display: 'flex', gap: 12 }}>
                <Avatar name={reply.user.name} />
                <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{reply.user.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                      {new Date(reply.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{reply.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Write a reply</p>
          <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Your answer or comment…"
              rows={4}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: 'var(--text)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
            {error && <p style={{ fontSize: 12, color: '#ef4444' }}>{error}</p>}
            <button
              type="submit"
              disabled={replying}
              style={{ alignSelf: 'flex-end', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: replying ? 'not-allowed' : 'pointer', opacity: replying ? 0.6 : 1 }}
            >
              {replying ? 'Posting…' : 'Post reply'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
