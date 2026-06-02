'use client'

import { useState } from 'react'

export default function AlertsPage() {
  const [slackWebhook, setSlackWebhook] = useState('')
  const [thresholds, setThresholds] = useState({ p50: true, p80: true, p100: true })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Alerts</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
          Configure budget thresholds and notification channels
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        <div>
          <div className="card" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>Alert History</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              No alerts have been triggered yet. Alerts appear here after real usage crosses configured thresholds.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px' }}>Budget Thresholds</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { key: 'p50', label: '50%', desc: 'Early heads-up', color: 'var(--muted)' },
                { key: 'p80', label: '80%', desc: 'Warning level', color: 'var(--yellow)' },
                { key: 'p100', label: '100%', desc: 'Budget exceeded', color: 'var(--red)' },
              ].map(({ key, label, desc, color }) => (
                <div key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'var(--surface2)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color }}>{label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{desc}</div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                    <input
                      type="checkbox"
                      checked={thresholds[key as keyof typeof thresholds]}
                      onChange={e => setThresholds(prev => ({ ...prev, [key]: e.target.checked }))}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: thresholds[key as keyof typeof thresholds] ? 'var(--accent)' : 'var(--border)',
                      borderRadius: '22px',
                      transition: '0.2s',
                    }}>
                      <span style={{
                        position: 'absolute',
                        height: '16px',
                        width: '16px',
                        left: thresholds[key as keyof typeof thresholds] ? '21px' : '3px',
                        bottom: '3px',
                        background: 'white',
                        borderRadius: '50%',
                        transition: '0.2s',
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>Slack Notifications</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 14px' }}>
              Paste your Slack incoming webhook URL to receive alerts in a channel.
            </p>
            <input
              className="input-field"
              placeholder="https://hooks.slack.com/services/..."
              value={slackWebhook}
              onChange={e => setSlackWebhook(e.target.value)}
            />
          </div>

          <button onClick={handleSave} className="btn-primary" style={{ justifyContent: 'center' }}>
            {saved ? 'Saved' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  )
}
