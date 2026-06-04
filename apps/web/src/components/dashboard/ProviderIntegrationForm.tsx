'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const providers = [
  { value: 'openai', label: 'OpenAI', hint: 'Admin key with organization usage access' },
  { value: 'anthropic', label: 'Anthropic Claude', hint: 'Admin key with usage report access' },
  { value: 'github_copilot', label: 'GitHub Copilot', hint: 'Fine-grained token with Copilot metrics access' },
]

export default function ProviderIntegrationForm() {
  const router = useRouter()
  const [provider, setProvider] = useState('openai')
  const [displayName, setDisplayName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [engineerEmail, setEngineerEmail] = useState('support@flowlog.dev')
  const [engineerName, setEngineerName] = useState('Fabio Almeida')
  const [githubOrg, setGithubOrg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/provider-integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        display_name: displayName,
        api_key: apiKey,
        engineer_email: engineerEmail,
        engineer_name: engineerName,
        github_org: githubOrg,
      }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      setError(data?.error ?? 'Could not save integration.')
      setLoading(false)
      return
    }

    setDisplayName('')
    setApiKey('')
    setGithubOrg('')
    setLoading(false)
    router.refresh()
  }

  const selected = providers.find(item => item.value === provider)

  return (
    <form onSubmit={submit} className="card" style={{ display: 'grid', gap: '14px' }}>
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px' }}>Connect Provider</h2>
        <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
          Import token usage from provider admin APIs into TokenWatch.
        </p>
      </div>

      <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
        Provider
        <select className="input-field" value={provider} onChange={e => setProvider(e.target.value)}>
          {providers.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 500 }}>{selected?.hint}</span>
      </label>

      <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
        Display name
        <input className="input-field" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Fabio OpenAI account" required />
      </label>

      <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
        API key or token
        <input
          className="input-field"
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="Paste a new provider admin key"
          autoComplete="new-password"
          name="provider-api-key-new"
          required
        />
        <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 500 }}>
          Provider keys are encrypted. Use Delete key on a connected provider to remove a saved key.
        </span>
      </label>

      {provider === 'github_copilot' && (
        <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
          GitHub organization
          <input className="input-field" value={githubOrg} onChange={e => setGithubOrg(e.target.value)} placeholder="your-github-org" required />
        </label>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
          Assign email
          <input className="input-field" type="email" value={engineerEmail} onChange={e => setEngineerEmail(e.target.value)} placeholder="support@flowlog.dev" />
        </label>
        <label style={{ display: 'grid', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
          Assign name
          <input className="input-field" value={engineerName} onChange={e => setEngineerName(e.target.value)} placeholder="Fabio Almeida" />
        </label>
      </div>

      {error && (
        <div style={{ color: 'var(--red)', fontSize: '13px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 12px' }}>
          {error}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
        {loading ? 'Saving...' : 'Save Provider'}
      </button>
    </form>
  )
}
