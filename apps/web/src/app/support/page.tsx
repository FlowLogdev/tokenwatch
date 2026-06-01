'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function SupportPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ticketNumber, setTicketNumber] = useState('')

  async function submitTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setTicketNumber('')

    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())

    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(result.error ?? 'Could not create the ticket.')
      return
    }

    setTicketNumber(result.ticketNumber)
    event.currentTarget.reset()
  }

  return (
    <main className="form-page">
      <section className="form-panel">
        <div className="form-panel-header">
          <Link href="/" className="brand-mark">Token<span>Watch</span></Link>
          <h1>Support that creates a visible ticket trail.</h1>
          <p>
            Submit a request and TokenWatch will generate a ticket number, email a copy to you, and notify support@flowlog.dev.
          </p>
        </div>

        <div className="card">
          <form className="stack-form" onSubmit={submitTicket}>
            <label>
              Your name
              <input className="input-field" name="name" placeholder="Jordan Lee" required />
            </label>
            <label>
              Email address
              <input className="input-field" type="email" name="email" placeholder="you@company.com" required />
            </label>
            <label>
              Company
              <input className="input-field" name="company" placeholder="Company name" />
            </label>
            <label>
              Subject
              <input className="input-field" name="subject" placeholder="Billing, setup, alerting, or dashboard issue" required />
            </label>
            <label>
              Details
              <textarea className="input-field" name="description" placeholder="Tell us what happened, what you expected, and any relevant account details." required />
            </label>

            {error && <div className="error-box">{error}</div>}
            {ticketNumber && (
              <div className="notice-box">
                Ticket {ticketNumber} was created. A copy was sent to your email and support@flowlog.dev.
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? 'Creating ticket...' : 'Create ticket'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
