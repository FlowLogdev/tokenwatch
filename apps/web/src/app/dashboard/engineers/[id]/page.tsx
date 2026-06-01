import Link from 'next/link'
import { formatCents, formatTokens } from '@/types'
import { MOCK_ENGINEER_DETAIL } from '@/lib/mock-data'
import EngineerSpendChart from '@/components/charts/EngineerSpendChart'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function EngineerDetailPage({ params }: { params: { id: string } }) {
  const eng = MOCK_ENGINEER_DETAIL
  const budgetPct = Math.round((eng.spendCents / eng.monthlyBudgetCents) * 100)

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>
        <Link href="/dashboard/engineers" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Engineers</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ color: 'var(--text)' }}>{eng.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px' }}>{eng.name}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
            {eng.team} · {eng.email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-ghost" style={{ fontSize: '13px', padding: '8px 16px' }}>Edit Budget</button>
          <button className="btn-ghost" style={{ fontSize: '13px', padding: '8px 16px' }}>Alert History</button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'MTD Spend', value: formatCents(eng.spendCents), sub: `${budgetPct}% of budget`, color: budgetPct >= 80 ? 'var(--red)' : 'var(--muted)' },
          { label: 'Monthly Budget', value: formatCents(eng.monthlyBudgetCents), sub: `${formatCents(eng.monthlyBudgetCents - eng.spendCents)} remaining`, color: 'var(--green)' },
          { label: 'Total Tokens', value: formatTokens(eng.tokens), sub: 'this month', color: 'var(--muted)' },
          { label: 'Sessions', value: String(eng.sessionCount), sub: 'this month', color: 'var(--muted)' },
        ].map(card => (
          <div key={card.label} className="kpi-card">
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              {card.label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, marginBottom: '4px' }}>{card.value}</div>
            <div style={{ fontSize: '12px', color: card.color }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '24px', marginBottom: '24px' }}>
        <EngineerSpendChart data={eng.dailySpend} />
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 16px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            By Tool
          </h3>
          {eng.toolBreakdown.map(t => (
            <div key={t.tool} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                <span>{t.tool}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '12px' }}>{t.pct}%</span>
              </div>
              <div style={{ height: '4px', background: 'var(--surface2)', borderRadius: '2px' }}>
                <div style={{ width: `${t.pct}%`, height: '100%', background: t.color, borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Recent Sessions</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Tool</th>
              <th>Duration</th>
              <th className="num">Cost</th>
              <th className="num">Tokens</th>
            </tr>
          </thead>
          <tbody>
            {eng.sessions.map((session, i) => (
              <tr key={i}>
                <td style={{ fontSize: '13px' }}>{session.date}</td>
                <td>
                  <span style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '12px',
                  }}>
                    {session.tool}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)' }}>{session.duration}</td>
                <td className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{formatCents(session.cost)}</td>
                <td className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)' }}>{formatTokens(session.tokens)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
