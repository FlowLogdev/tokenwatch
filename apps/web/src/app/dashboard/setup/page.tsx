'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

const installCommand = 'npm install -g tokenwatch-agent'
const initCommand = 'tokenwatch init --key <issued-api-key> --email you@company.com --name "Your Name"'
const startCommand = 'tokenwatch start'

export default function SetupPage() {
  const router = useRouter()

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
          Production setup
        </p>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 10px' }}>Connect real usage data</h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.7, maxWidth: '620px', margin: 0 }}>
          TokenWatch only reports usage after an approved organization has an issued API key and the tracking agent is running on engineer machines.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '18px' }}>
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <StepNumber value="1" />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Issue an API key</h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px' }}>
                Generate the organization key from Settings or Admin after the customer is approved. API keys are only shown when created and stored as hashes after that.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link href="/dashboard/settings" className="btn-primary" style={{ textDecoration: 'none' }}>
                  Open Settings
                </Link>
                <Link href="/dashboard/admin" className="btn-ghost" style={{ textDecoration: 'none' }}>
                  Open Admin
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <StepNumber value="2" />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Install the tracking agent</h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px' }}>
                Run the agent on each engineer machine with the issued key and the engineer identity you want reflected in reports.
              </p>
              <CommandBlock command={installCommand} />
              <CommandBlock command={initCommand} />
              <CommandBlock command={startCommand} />
            </div>
          </div>
        </section>

        <section className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <StepNumber value="3" />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Confirm ingestion</h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px' }}>
                Once the agent sends events, the dashboard, engineer pages, tool totals, budget views, and alerts will populate from Supabase.
              </p>
              <button onClick={() => router.push('/dashboard')} className="btn-primary">
                Back to Dashboard
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function StepNumber({ value }: { value: string }) {
  return (
    <div style={{
      width: '34px',
      height: '34px',
      borderRadius: '50%',
      background: 'var(--accent)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 800,
      flexShrink: 0,
    }}>
      {value}
    </div>
  )
}

function CommandBlock({ command }: { command: string }) {
  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '12px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      color: 'var(--accent)',
      marginTop: '10px',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
    }}>
      {command}
    </div>
  )
}
