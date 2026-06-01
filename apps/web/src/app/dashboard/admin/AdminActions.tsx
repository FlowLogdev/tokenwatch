'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function RegistrationAction({ orgId, action }: { orgId: string; action: 'approve' | 'deny' }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    await fetch(`/api/registrations/${orgId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      type="button"
      className={action === 'approve' ? 'btn-primary' : 'btn-ghost'}
      onClick={run}
      disabled={loading}
      style={{ padding: '8px 12px', fontSize: 12 }}
    >
      {loading ? 'Saving...' : action === 'approve' ? 'Approve' : 'Deny'}
    </button>
  )
}
