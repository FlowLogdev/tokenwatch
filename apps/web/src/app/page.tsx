'use client'

import Link from 'next/link'

const TICKER_ITEMS = [
  '🔴 Anthropic raises Claude API prices 15% — effective next month',
  '⚠️ OpenAI reports $5B in API revenue — developers\' budgets under pressure',
  '📊 Survey: 67% of engineering teams have no visibility into AI tool spend',
  '💸 Average developer now spending $340/month on AI coding tools',
  '🚨 GitHub Copilot Enterprise costs surge 40% for large orgs',
  '📈 Claude Code usage up 3x in Q1 — teams scrambling to track costs',
  '⚡ Cursor AI raises prices — third increase in 12 months',
  '🔍 83% of CTOs say AI spend is their fastest-growing line item',
]

const FEATURES = [
  {
    icon: '👤',
    title: 'Per-Engineer Visibility',
    desc: 'See exactly who is spending what, on which tools, in real time. No more end-of-month surprises.',
  },
  {
    icon: '🔔',
    title: 'Budget Alerts',
    desc: 'Set thresholds at 50%, 80%, and 100% of budget. Get notified via email or Slack before limits are hit.',
  },
  {
    icon: '🔴',
    title: 'Anomaly Detection',
    desc: 'AI spots when an engineer spends 3x their daily average. Flags it before it becomes a problem.',
  },
  {
    icon: '📈',
    title: 'ROI Attribution',
    desc: 'Link AI spend to commits, PRs, and story points. Quantify the return on your AI investment.',
  },
  {
    icon: '🛠️',
    title: 'Multi-Tool Support',
    desc: 'Works with Claude Code, GitHub Copilot, Cursor, ChatGPT, and Codex. One dashboard for all tools.',
  },
  {
    icon: '⚡',
    title: '2-Minute Setup',
    desc: 'One npm install. One API key. Engineers see their spend in under two minutes.',
  },
]

const PRICING = [
  {
    name: 'Starter',
    price: '$29',
    period: '/mo',
    engineers: 'Up to 10 engineers',
    features: ['All tools tracked', 'Budget alerts', 'Email notifications', '30-day history', 'API access'],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Team',
    price: '$99',
    period: '/mo',
    engineers: 'Up to 50 engineers',
    features: ['Everything in Starter', 'Slack alerts', 'Anomaly detection', '1-year history', 'Team budgets', 'Priority support'],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$499',
    period: '/mo',
    engineers: 'Unlimited engineers',
    features: ['Everything in Team', 'SSO / SAML', 'Custom integrations', 'SLA guarantee', 'Dedicated support', 'Custom contracts'],
    cta: 'Contact sales',
    highlight: false,
  },
]

export default function LandingPage() {
  const tickerText = TICKER_ITEMS.join('   ·   ')
  const doubled = tickerText + '   ·   ' + tickerText

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 40px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'rgba(10,10,11,0.9)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--accent)' }}>
            Token<span style={{ color: 'var(--text)' }}>Watch</span>
          </span>
          <div style={{ display: 'flex', gap: '28px' }}>
            {['Features', 'Pricing', 'Docs'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{
                color: 'var(--muted)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--muted)')}
              >{item}</a>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/auth/login" style={{
            color: 'var(--muted)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}>Sign in</Link>
          <Link href="/auth/signup" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none' }}>
            Start free trial
          </Link>
        </div>
      </nav>

      {/* News Ticker */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 0',
        overflow: 'hidden',
      }}>
        <div className="ticker-track" style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {doubled}
        </div>
      </div>

      {/* Hero */}
      <section style={{
        padding: '100px 40px 80px',
        maxWidth: '960px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--accent-muted)',
          border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: '20px',
          padding: '6px 14px',
          marginBottom: '32px',
          fontSize: '13px',
          color: 'var(--accent)',
          fontWeight: 600,
        }}>
          <span className="live-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          Live tracking for Claude Code, Copilot, Cursor, ChatGPT
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '24px',
          letterSpacing: '-0.02em',
        }}>
          Know before the<br />
          <span style={{ color: 'var(--accent)' }}>invoice arrives</span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'var(--muted)',
          maxWidth: '560px',
          margin: '0 auto 40px',
          lineHeight: 1.6,
        }}>
          TokenWatch tracks what your engineering team spends on AI developer tools — per engineer, per team, per project. Real-time visibility. Budget alerts. No surprises.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '60px' }}>
          <Link href="/auth/signup" className="btn-primary" style={{ fontSize: '15px', padding: '12px 24px', textDecoration: 'none' }}>
            Start free trial →
          </Link>
          <a href="#features" className="btn-ghost" style={{ fontSize: '15px', padding: '12px 24px' }}>
            See how it works
          </a>
        </div>

        {/* Stat callouts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {[
            { value: '$1,200', label: 'Avg monthly surprise on first invoice', sub: 'without visibility' },
            { value: '83%', label: 'Of teams miss their AI budgets', sub: 'every month' },
            { value: '4 months', label: 'To blow a yearly AI budget', sub: 'at current growth rates' },
          ].map(stat => (
            <div key={stat.value} style={{
              background: 'var(--surface)',
              padding: '28px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500, marginBottom: '4px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>FEATURES</div>
          <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Everything you need to control AI spend
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: 'var(--surface)',
              padding: '28px',
              transition: 'background 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--surface2)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--surface)')}
            >
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>PRICING</div>
          <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Simple flat-rate pricing
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
            Token-based pricing is the problem we&apos;re solving — not what we charge you.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '48px' }}>
          {PRICING.map(plan => (
            <div key={plan.name} style={{
              background: plan.highlight ? 'var(--surface2)' : 'var(--surface)',
              border: plan.highlight ? '1px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: '12px',
              padding: '28px',
              position: 'relative',
            }}>
              {plan.highlight && (
                <div style={{
                  position: 'absolute',
                  top: '-1px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '0 0 8px 8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Most Popular
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '40px', fontWeight: 700 }}>{plan.price}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{plan.period}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{plan.engineers}</div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--green)', fontSize: '16px' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/auth/signup" style={{
                display: 'block',
                textAlign: 'center',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                background: plan.highlight ? 'var(--accent)' : 'transparent',
                color: plan.highlight ? 'white' : 'var(--text)',
                border: plan.highlight ? 'none' : '1px solid var(--border)',
                transition: 'opacity 0.15s',
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{
        padding: '80px 40px',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--red)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '16px',
        }}>
          THE PROBLEM
        </div>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 800,
          marginBottom: '16px',
          letterSpacing: '-0.02em',
          maxWidth: '640px',
          margin: '0 auto 16px',
        }}>
          Invisible spend is the problem.<br />TokenWatch is the fix.
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '36px' }}>
          Engineering teams are flying blind on AI costs. Start seeing clearly in 2 minutes.
        </p>
        <Link href="/auth/signup" className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px', textDecoration: 'none' }}>
          Start free trial — no credit card required
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 40px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
        color: 'var(--muted)',
      }}>
        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>TokenWatch</span>
        <span>© 2026 TokenWatch. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Terms</a>
          <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Docs</a>
        </div>
      </footer>
    </div>
  )
}
