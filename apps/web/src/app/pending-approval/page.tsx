import Link from 'next/link'

export default function PendingApprovalPage() {
  return (
    <main className="form-page">
      <section className="form-panel">
        <Link href="/" className="brand-mark">Token<span>Watch</span></Link>
        <div className="card" style={{ marginTop: 28 }}>
          <span className="status-badge">Pending review</span>
          <h1 style={{ fontSize: 34, margin: '18px 0 10px' }}>Your access request is with Flowlog support.</h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            support@flowlog.dev has been notified. Once your organization is approved, you will receive an email with the pricing page so you can choose and pay for your subscription.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <Link href="/support" className="btn-ghost">Contact support</Link>
            <Link href="/auth/login" className="btn-primary">Back to sign in</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
