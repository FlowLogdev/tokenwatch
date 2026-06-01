import Link from 'next/link'

export default function AccessDeniedPage() {
  return (
    <main className="form-page">
      <section className="form-panel">
        <Link href="/" className="brand-mark">Token<span>Watch</span></Link>
        <div className="card" style={{ marginTop: 28 }}>
          <span className="status-badge">Not approved</span>
          <h1 style={{ fontSize: 34, margin: '18px 0 10px' }}>This account is not approved for dashboard access.</h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            If you believe this should be reviewed again, open a support ticket and include the email address used for registration.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <Link href="/support" className="btn-primary">Open support ticket</Link>
            <Link href="/" className="btn-ghost">Return home</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
