'use client'

import { useState } from 'react'
import type { Plan } from '@/types'

export default function CheckoutButton({
  plan,
  label,
  disabled,
  variant = 'primary',
}: {
  plan: Plan
  label: string
  disabled?: boolean
  variant?: 'primary' | 'ghost'
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function checkout() {
    setLoading(true)
    setError('')
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const result = await response.json()
    setLoading(false)

    if (!response.ok || !result.url) {
      setError(result.error ?? 'Could not start Stripe checkout.')
      return
    }

    window.location.href = result.url
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <button
        type="button"
        className={variant === 'primary' ? 'btn-primary' : 'btn-ghost'}
        disabled={disabled || loading}
        onClick={checkout}
        style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: 8 }}
      >
        {loading ? 'Opening Stripe...' : label}
      </button>
      {error && <span style={{ color: 'var(--red)', fontSize: 12 }}>{error}</span>}
    </div>
  )
}
