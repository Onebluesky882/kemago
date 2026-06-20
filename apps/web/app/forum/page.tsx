'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://fullstack-builder-api.onebluesky882.workers.dev'

type Post = { id: string; title: string; body: string; createdAt: string; user: { id: string; name: string } }

export default function ForumPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch(`${API}/api/forum`, { credentials: 'include' })
    if (res.ok) setPosts(await res.json())
  }

  useEffect(() => { load() }, [])

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setPosting(true)
    setError('')
    const res = await fetch(`${API}/api/forum`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, body }),
    })
    if (res.ok) {
      setTitle('')
      setBody('')
      load()
    } else {
      const d = await res.json() as { error?: string }
      setError(d.error === 'Unauthorized' ? 'Please sign in to post.' : (d.error ?? 'Failed'))
    }
    setPosting(false)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Navbar />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>Forum</p>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Community Q&A</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Ask questions, share what you've built, get help.</p>
        </div>

        {/* New post form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', marginBottom: 32 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Ask a question</p>
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title — what's your question?"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: 'var(--text)', outline: 'none' }}
            />
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Describe your question in detail…"
              rows={4}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: 'var(--text)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
            {error && <p style={{ fontSize: 12, color: '#ef4444' }}>{error}</p>}
            <button
              type="submit"
              disabled={posting}
              style={{ alignSelf: 'flex-end', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: posting ? 'not-allowed' : 'pointer', opacity: posting ? 0.6 : 1 }}
            >
              {posting ? 'Posting…' : 'Post question'}
            </button>
          </form>
        </div>

        {/* Post list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {posts.length === 0 && (
            <p style={{ fontSize: 14, color: 'var(--text-faint)', textAlign: 'center', padding: '40px 0' }}>No posts yet — be the first to ask.</p>
          )}
          {posts.map((post) => (
            <Link key={post.id} href={`/forum/${post.id}`} style={{ textDecoration: 'none' }}>
              <div className="card-hover" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px', marginBottom: 8, transition: 'border-color 150ms' }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6, lineHeight: 1.4 }}>{post.title}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.body}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>
                    {post.user.name[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{post.user.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-faint)', marginLeft: 'auto' }}>
                    {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
