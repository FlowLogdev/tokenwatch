'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProviderIntegrationActions({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function syncNow() {
    setLoading(true)
    await fetch('/api/provider-integrations/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setLoading(false)
    router.refresh()
  }

  async function setStatus(nextStatus: 'active' | 'paused') {
    setLoading(true)
    await fetch('/api/provider-integrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: nextStatus }),
    })
    setLoading(false)
    router.refresh()
  }

  async function remove() {
    if (!window.confirm('Delete this provider integration and its encrypted API key?')) return
    setLoading(true)
    await fetch(`/api/provider-integrations?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <button className="btn-primary" onClick={syncNow} disabled={loading} style={{ fontSize: '12px', padding: '7px 12px' }}>
        {loading ? 'Working...' : 'Sync now'}
      </button>
      <button className="btn-ghost" onClick={() => setStatus(status === 'paused' ? 'active' : 'paused')} disabled={loading} style={{ fontSize: '12px', padding: '7px 12px' }}>
        {status === 'paused' ? 'Resume' : 'Pause'}
      </button>
      <button
        onClick={remove}
        disabled={loading}
        style={{
          border: '1px solid rgba(239,68,68,0.35)',
          background: 'rgba(239,68,68,0.08)',
          color: 'var(--red)',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 700,
          padding: '7px 12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Delete
      </button>
    </div>
  )
}
