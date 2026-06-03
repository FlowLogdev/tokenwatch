'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ApiKeyActions({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function revoke() {
    if (!window.confirm(`Revoke API key "${name}"? Existing agents using this key will stop sending data.`)) return
    setLoading(true)
    await fetch(`/api/api-keys?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={revoke}
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
      {loading ? 'Revoking...' : 'Revoke'}
    </button>
  )
}
