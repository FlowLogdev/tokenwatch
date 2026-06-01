import Link from 'next/link'
import { formatCents } from '@/types'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 2900,
    engineers: 10,
    features: ['10 engineers', 'All tools tracked', 'Budget alerts', 'Email notifications', '30-day history'],
  },
  {
    id: 'team',
    name: 'Team',
    price: 9900,
    engineers: 50,
    features: ['50 engineers', 'Everything in Starter', 'Slack alerts', 'Anomaly detection', '1-year history'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49900,
    engineers: Infinity,
    features: ['Unlimited engineers', 'Everything in Team', 'SSO / SAML', 'SLA guarantee', 'Dedicated support'],
  },
]

export default function BillingPage() {
  const currentPlan = 'starter'

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <Link href="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px' }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '16px 0 4px' }}>Billing</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          Manage your subscription and usage
        </p>
      </div>

      {/* Current plan */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Current Plan</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>Starter</div>
            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>$29/month · Up to 10 engineers</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>Engineers used</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700 }}>4 / 10</div>
          </div>
        </div>
      </div>

      {/* Upgrade plans */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Change Plan</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            background: plan.popular ? 'var(--surface2)' : 'var(--surface)',
            border: plan.id === currentPlan ? '2px solid var(--accent)' : plan.popular ? '1px solid rgba(249,115,22,0.3)' : '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            position: 'relative',
          }}>
            {plan.id === currentPlan && (
              <div style={{
                position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--accent)', color: 'white', fontSize: '10px', fontWeight: 700,
                padding: '3px 10px', borderRadius: '0 0 6px 6px', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Current</div>
            )}
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{plan.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>
              {formatCents(plan.price)}<span style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>/mo</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: 'flex', gap: '6px', color: 'var(--muted)' }}>
                  <span style={{ color: 'var(--green)' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              className={plan.id === currentPlan ? 'btn-ghost' : 'btn-primary'}
              style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '8px' }}
              disabled={plan.id === currentPlan}
            >
              {plan.id === currentPlan ? 'Current plan' : plan.price > 2900 ? 'Upgrade' : 'Downgrade'}
            </button>
          </div>
        ))}
      </div>

      {/* Manage subscription */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>Manage Subscription</h3>
        <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 16px' }}>
          Update payment method, view invoices, or cancel your subscription via the Stripe Customer Portal.
        </p>
        <button className="btn-ghost" style={{ fontSize: '14px' }}>
          Open Customer Portal →
        </button>
      </div>
    </div>
  )
}
