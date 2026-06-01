'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API_KEY = 'TW_a3f7c9d2e8b41f6a9c3e7d5b2a8f4c1e'

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [orgName, setOrgName] = useState('')
  const [budget, setBudget] = useState('2000')
  const [copied, setCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  function copyKey() {
    navigator.clipboard.writeText(API_KEY)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>Welcome to TokenWatch</h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
          Let&apos;s get you set up in under 2 minutes.
        </p>
      </div>

      {/* Progress steps */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', alignItems: 'center' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: s < step ? 'var(--green)' : s === step ? 'var(--accent)' : 'var(--surface2)',
              border: `2px solid ${s <= step ? (s < step ? 'var(--green)' : 'var(--accent)') : 'var(--border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
              color: s <= step ? 'white' : 'var(--muted)',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}>
              {s < step ? '✓' : s}
            </div>
            {s < 3 && (
              <div style={{ flex: 1, height: '2px', background: s < step ? 'var(--green)' : 'var(--border)', margin: '0 8px', transition: 'background 0.2s' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Org setup */}
      {step === 1 && (
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>Set up your organization</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '0 0 24px' }}>
            Give your team a name and set a monthly AI spend budget.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Organization name</label>
              <input className="input-field" placeholder="Acme Engineering" value={orgName} onChange={e => setOrgName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Monthly AI budget</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px' }}>$</span>
                <input
                  className="input-field"
                  type="number"
                  placeholder="2000"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '6px 0 0' }}>
                You&apos;ll get alerts at 50%, 80%, and 100% of this limit.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStep(2)}
            className="btn-primary"
            style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Install agent */}
      {step === 2 && (
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>Install the tracking agent</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '0 0 24px' }}>
            Engineers run this once on their machine. It watches for AI tool usage in the background.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              1. Install
            </div>
            <div style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              color: 'var(--accent)',
            }}>
              npm install -g tokenwatch-agent
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              2. Initialize with your API key
            </div>
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
              <span style={{ color: 'var(--accent)' }}>tokenwatch init --key <span style={{ color: 'var(--text)' }}>{API_KEY}</span></span>
              <button
                onClick={copyKey}
                style={{
                  background: copied ? 'var(--green)' : 'var(--border)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  flexShrink: 0,
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '13px',
            color: 'var(--green)',
            marginBottom: '24px',
          }}>
            ✓ Works on Mac, Windows, and Linux · Captures Claude Code, Cursor, ChatGPT, Copilot
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(1)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
            <button onClick={() => setStep(3)} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Invite */}
      {step === 3 && (
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>Invite your engineers</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '0 0 24px' }}>
            Optional — you can also share the API key directly. Each engineer runs the init command once.
          </p>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email address</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="input-field"
                type="email"
                placeholder="engineer@company.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
              <button className="btn-primary" style={{ flexShrink: 0 }}>Send invite</button>
            </div>
          </div>

          <div style={{ margin: '24px 0', height: '1px', background: 'var(--border)' }} />

          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '12px' }}
          >
            Go to Dashboard →
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', marginTop: '12px', width: '100%', fontFamily: 'var(--font-sans)' }}
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  )
}
