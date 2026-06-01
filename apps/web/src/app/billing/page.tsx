import Link from 'next/link'
import CheckoutButton from './CheckoutButton'
import { formatCents, type Plan } from '@/types'
import { requireAppUser, isSupportAdmin } from '@/lib/authz'

export const dynamic = 'force-dynamic'

const PLANS: Array<{
  id: Plan
  name: string
  price: number
  features: string[]
  popular?: boolean
}> = [
  {
    id: 'starter',
    name: 'Starter',
    price: 2900,
    features: ['10 engineers', 'All tools tracked', 'Budget alerts', 'Email notifications', '30-day history'],
  },
  {
    id: 'team',
    name: 'Team',
    price: 9900,
    features: ['50 engineers', 'Everything in Starter', 'Slack alerts', 'Anomaly detection', '1-year history'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49900,
    features: ['Unlimited engineers', 'Everything in Team', 'SSO / SAML', 'SLA guarantee', 'Dedicated support'],
  },
]

export default async function BillingPage() {
  const { profile, organization } = await requireAppUser()
  const currentPlan = organization.plan
  const approved = organization.approval_status === 'approved' || isSupportAdmin(profile)
  const active = organization.subscription_status === 'active'

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <Link href={active ? '/dashboard' : '/'} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px' }}>
          Back
        </Link>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '16px 0 4px' }}>Choose your TokenWatch plan</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7 }}>
          Approved customers pay through Stripe. Dashboard access opens after the subscription is active.
        </p>
      </div>

      {!approved && (
        <div className="card" style={{ marginBottom: 32 }}>
          <span className="status-badge">{organization.approval_status}</span>
          <h2 style={{ margin: '14px 0 8px', fontSize: 20 }}>Your account is not ready for billing.</h2>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Flowlog support must approve the registration before a Stripe checkout session can be opened.
          </p>
        </div>
      )}

      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Current status</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{organization.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
              Approval: {organization.approval_status} · Subscription: {organization.subscription_status}
            </div>
          </div>
          <span className="status-badge">{active ? 'active' : 'payment required'}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {PLANS.map(plan => {
          const isCurrent = plan.id === currentPlan && active
          return (
            <div key={plan.id} style={{
              background: plan.popular ? 'var(--surface2)' : 'var(--surface)',
              border: isCurrent ? '2px solid var(--accent)' : plan.popular ? '1px solid rgba(215,111,54,0.34)' : '1px solid var(--border)',
              borderRadius: '8px',
              padding: '20px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              {isCurrent && <span className="status-badge">Current</span>}
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>{plan.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700 }}>
                  {formatCents(plan.price)}<span style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>/mo</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 auto', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: '6px', color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--green)' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <CheckoutButton
                plan={plan.id}
                label={isCurrent ? 'Current plan' : 'Pay with Stripe'}
                disabled={!approved || isCurrent}
                variant={plan.popular ? 'primary' : 'ghost'}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
