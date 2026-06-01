'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const apiKey = 'TW_a3f7c9d2e8b41f6a9c3e7d5b2a8f4c1e'

  function copyKey() {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Settings</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
          Manage your organization and API keys
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Org */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px' }}>Organization</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Organization name</label>
              <input className="input-field" defaultValue="Acme Corp" />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Slug</label>
              <input className="input-field" defaultValue="acme-corp" />
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop: '16px', fontSize: '13px', padding: '8px 16px' }}>
            Save Changes
          </button>
        </div>

        {/* API Keys */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>API Keys</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px' }}>
            Use this key with the <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface2)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>tokenwatch-agent</code> CLI.
          </p>
          <div style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {apiKeyVisible ? apiKey : 'TW_' + '•'.repeat(32)}
            </span>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => setApiKeyVisible(v => !v)}
                style={{ background: 'var(--border)', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
              >
                {apiKeyVisible ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={copyKey}
                style={{ background: copied ? 'var(--green)' : 'var(--border)', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
          <button className="btn-ghost" style={{ marginTop: '12px', fontSize: '13px', padding: '8px 16px' }}>
            + Generate New Key
          </button>
        </div>

        {/* Billing */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>Billing</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px' }}>
            You&apos;re on the <strong>Starter plan</strong> · $29/month
          </p>
          <Link href="/billing" className="btn-ghost" style={{ fontSize: '13px', padding: '8px 16px', textDecoration: 'none' }}>
            Manage Subscription →
          </Link>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: 'var(--red)' }}>Danger Zone</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px' }}>
            Permanently delete your organization and all data. This cannot be undone.
          </p>
          <button style={{
            background: 'transparent',
            border: '1px solid rgba(239,68,68,0.5)',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            color: 'var(--red)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
          }}>
            Delete Organization
          </button>
        </div>
      </div>
    </div>
  )
}
