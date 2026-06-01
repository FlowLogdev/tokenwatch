import Link from 'next/link'

const SIGNALS = [
  { label: 'Tracked spend', value: '$18.4k', note: 'current month' },
  { label: 'Forecast drift', value: '+12.8%', note: 'above budget' },
  { label: 'Engineers', value: '47', note: 'active seats' },
]

const CAPABILITIES = [
  {
    title: 'Cost ownership by engineer',
    body: 'Map AI tool usage to the people and teams creating it, with clean rollups for finance and engineering leadership.',
  },
  {
    title: 'Budget controls before invoices',
    body: 'Set team thresholds, detect unusual spending, and alert the right owner while there is still time to act.',
  },
  {
    title: 'Subscription-ready access',
    body: 'New customers request access, get approved by your admin team, choose a plan, and reach the dashboard after payment.',
  },
  {
    title: 'Support built into the product',
    body: 'Customers can open tickets, receive email copies, and follow every response from their own dashboard.',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: '$29',
    summary: 'For small teams tracking early AI adoption.',
    details: ['10 engineers', 'Budget alerts', 'Email notifications', '30-day history'],
  },
  {
    name: 'Team',
    price: '$99',
    summary: 'For teams with shared budgets and active usage.',
    details: ['50 engineers', 'Slack alerts', 'Anomaly detection', '1-year history'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '$499',
    summary: 'For organizations that need governance and custom support.',
    details: ['Unlimited engineers', 'SSO ready', 'Dedicated support', 'Custom integrations'],
  },
]

export default function LandingPage() {
  return (
    <main className="site-shell">
      <nav className="landing-nav" aria-label="Main navigation">
        <Link href="/" className="brand-mark" aria-label="TokenWatch home">
          Token<span>Watch</span>
        </Link>
        <div className="landing-nav-links">
          <a href="#platform">Platform</a>
          <a href="#pricing">Pricing</a>
          <Link href="/support">Support</Link>
        </div>
        <div className="landing-nav-actions">
          <Link href="/auth/login" className="text-link">Sign in</Link>
          <Link href="/auth/signup" className="btn-primary">Request access</Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">AI spend observability for engineering teams</p>
          <h1>Know where AI spend is moving before the invoice arrives.</h1>
          <p className="hero-lede">
            TokenWatch gives finance and engineering a shared operating view of AI developer-tool spend, budget risk, and support activity.
          </p>
          <div className="hero-actions">
            <Link href="/auth/signup" className="btn-primary">Request customer access</Link>
            <Link href="/support" className="btn-ghost">Open a support ticket</Link>
          </div>
        </div>

        <aside className="hero-console" aria-label="TokenWatch spend summary">
          <div className="console-header">
            <span>May usage close</span>
            <strong>Live</strong>
          </div>
          <div className="console-meter">
            <span style={{ width: '72%' }} />
          </div>
          <div className="signal-grid">
            {SIGNALS.map(signal => (
              <div key={signal.label}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
                <small>{signal.note}</small>
              </div>
            ))}
          </div>
          <div className="console-list">
            <div>
              <span>Claude Code</span>
              <strong>$6,820</strong>
            </div>
            <div>
              <span>Cursor</span>
              <strong>$4,190</strong>
            </div>
            <div>
              <span>ChatGPT</span>
              <strong>$3,470</strong>
            </div>
          </div>
        </aside>
      </section>

      <section id="platform" className="section-band">
        <div className="section-heading">
          <p className="eyebrow">Platform</p>
          <h2>Built for control, approvals, and customer care.</h2>
        </div>
        <div className="capability-grid">
          {CAPABILITIES.map(item => (
            <article key={item.title} className="capability-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="section-band pricing-band">
        <div className="section-heading">
          <p className="eyebrow">Pricing</p>
          <h2>Approved customers choose a plan after review.</h2>
          <p>
            Registration starts with an approval request. Once approved, customers receive the billing link and pay through Stripe before entering the dashboard.
          </p>
        </div>
        <div className="pricing-grid">
          {PLANS.map(plan => (
            <article key={plan.name} className={plan.featured ? 'pricing-card pricing-card-featured' : 'pricing-card'}>
              <div>
                <h3>{plan.name}</h3>
                <p>{plan.summary}</p>
              </div>
              <div className="price-row">
                <strong>{plan.price}</strong>
                <span>/mo</span>
              </div>
              <ul>
                {plan.details.map(detail => <li key={detail}>{detail}</li>)}
              </ul>
              <Link href="/auth/signup" className={plan.featured ? 'btn-primary' : 'btn-ghost'}>
                Request access
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-band">
        <div>
          <p className="eyebrow">Support operations</p>
          <h2>Every ticket has a number, an owner, and a visible trail.</h2>
        </div>
        <Link href="/support" className="btn-primary">Create support ticket</Link>
      </section>

      <footer className="landing-footer">
        <span className="brand-mark">Token<span>Watch</span></span>
        <span>© 2026 Flowlog. All rights reserved.</span>
        <div>
          <Link href="/support">Support</Link>
          <a href="mailto:support@flowlog.dev">support@flowlog.dev</a>
        </div>
      </footer>
    </main>
  )
}
