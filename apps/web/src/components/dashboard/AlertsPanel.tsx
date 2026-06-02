import Link from 'next/link'

interface Alert {
  id: string
  type: 'anomaly' | 'budget'
  engineerName: string
  message: string
  timestamp: string
  severity: 'high' | 'medium' | 'low'
}

const SEVERITY = {
  high: { label: 'HI', color: 'var(--red)' },
  medium: { label: 'MD', color: 'var(--yellow)' },
  low: { label: 'LO', color: 'var(--muted)' },
}

export default function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Recent Alerts</h3>
        <Link href="/dashboard/alerts" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
          Configure
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {alerts.length === 0 && (
          <div style={{ padding: '18px 20px', color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6 }}>
            No alerts have been triggered yet.
          </div>
        )}
        {alerts.map(alert => {
          const sev = SEVERITY[alert.severity]
          return (
            <div key={alert.id} style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              gap: '12px',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', flexShrink: 0, marginTop: '2px', color: sev.color }}>
                {sev.label}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{alert.engineerName}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{alert.message}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{alert.timestamp}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ padding: '14px 20px' }}>
        <Link href="/dashboard/alerts" style={{
          display: 'block',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--muted)',
          textDecoration: 'none',
          fontWeight: 500,
        }}>
          View all alerts
        </Link>
      </div>
    </div>
  )
}
