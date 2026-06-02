'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type EngineerOption = {
  id: string
  name: string
  email: string
}

const tools = [
  { value: 'claude_code', label: 'Claude' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'codex', label: 'Codex' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'copilot', label: 'Copilot' },
  { value: 'custom', label: 'Custom' },
]

export default function ToolSubscriptionForm({ engineers }: { engineers: EngineerOption[] }) {
  const router = useRouter()
  const [tool, setTool] = useState('claude_code')
  const [planName, setPlanName] = useState('')
  const [monthlyCost, setMonthlyCost] = useState('')
  const [engineerId, setEngineerId] = useState('')
  const [renewalDay, setRenewalDay] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/tool-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool,
        plan_name: planName,
        monthly_cost_dollars: monthlyCost,
        engineer_id: engineerId || null,
        renewal_day: renewalDay || null,
        notes: notes || null,
      }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      setError(data?.error ?? 'Could not save subscription.')
      setLoading(false)
      return
    }

    setPlanName('')
    setMonthlyCost('')
    setEngineerId('')
    setRenewalDay('')
    setNotes('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="card" style={{ display: 'grid', gap: '14px' }}>
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px' }}>Add Tool Subscription</h2>
        <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
          Add fixed monthly costs such as Claude, ChatGPT, or Codex plans.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Field label="Tool">
          <select className="input-field" value={tool} onChange={e => setTool(e.target.value)}>
            {tools.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </Field>

        <Field label="Plan name">
          <input className="input-field" value={planName} onChange={e => setPlanName(e.target.value)} placeholder="Pro, Team, Max" required />
        </Field>

        <Field label="Monthly cost">
          <input className="input-field" type="number" min="0" step="0.01" value={monthlyCost} onChange={e => setMonthlyCost(e.target.value)} placeholder="20.00" required />
        </Field>

        <Field label="Assigned engineer">
          <select className="input-field" value={engineerId} onChange={e => setEngineerId(e.target.value)}>
            <option value="">Organization level</option>
            {engineers.map(engineer => (
              <option key={engineer.id} value={engineer.id}>
                {engineer.name} ({engineer.email})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Renewal day">
          <input className="input-field" type="number" min="1" max="31" value={renewalDay} onChange={e => setRenewalDay(e.target.value)} placeholder="1" />
        </Field>

        <Field label="Notes">
          <input className="input-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional internal note" />
        </Field>
      </div>

      {error && (
        <div style={{ color: 'var(--red)', fontSize: '13px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 12px' }}>
          {error}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
        {loading ? 'Saving...' : 'Save Subscription'}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
      {label}
      {children}
    </label>
  )
}
