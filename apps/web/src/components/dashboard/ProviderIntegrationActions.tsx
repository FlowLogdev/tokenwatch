'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProviderIntegrationActions({ id }: { id: string }) {
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

  async function pause() {
    setLoading(true)
    await fetch('/api/provider-integrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'paused' }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <button className="btn-primary" onClick={syncNow} disabled={loading} style={{ fontSize: '12px', padding: '7px 12px' }}>
        {loading ? 'Working...' : 'Sync now'}
      </button>
      <button className="btn-ghost" onClick={pause} disabled={loading} style={{ fontSize: '12px', padding: '7px 12px' }}>
        Pause
      </button>
    </div>
  )
}
