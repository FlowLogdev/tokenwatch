'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function TicketReplyForm({
  ticketId,
  admin,
}: {
  ticketId: string
  admin?: boolean
}) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('in_progress')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const response = await fetch(`/api/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, status }),
    })
    const result = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(result.error ?? 'Could not send update.')
      return
    }

    setMessage('')
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="stack-form">
      {admin && (
        <label>
          Ticket status
          <select className="input-field" value={status} onChange={event => setStatus(event.target.value)}>
            <option value="in_progress">In progress</option>
            <option value="waiting_on_customer">Waiting on customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </label>
      )}
      <label>
        Update
        <textarea className="input-field" value={message} onChange={event => setMessage(event.target.value)} required />
      </label>
      {error && <div className="error-box">{error}</div>}
      <button className="btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
        {loading ? 'Sending...' : 'Send update'}
      </button>
    </form>
  )
}
