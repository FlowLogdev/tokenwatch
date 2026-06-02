'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function EngineerForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [team, setTeam] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/dashboard/engineers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, team: team || null }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      setError(data?.error ?? 'Could not save engineer.')
      setLoading(false)
      return
    }

    setName('')
    setEmail('')
    setTeam('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="card" style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px' }}>Add Engineer</h2>
        <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
          Add a real person before agent usage starts, then assign tool subscriptions to them.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: '12px' }}>
        <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
          Name
          <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Fabio Almeida" required />
        </label>
        <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
          Email
          <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="support@flowlog.dev" required />
        </label>
        <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
          Team
          <input className="input-field" value={team} onChange={e => setTeam(e.target.value)} placeholder="Admin" />
        </label>
      </div>
      {error && (
        <div style={{ color: 'var(--red)', fontSize: '13px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 12px' }}>
          {error}
        </div>
      )}
      <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', width: '180px' }}>
        {loading ? 'Saving...' : 'Add Engineer'}
      </button>
    </form>
  )
}
