import { formatCents } from '@/types'
import BudgetForecastChart from '@/components/charts/BudgetForecastChart'
import { requireAppUser } from '@/lib/authz'

export const dynamic = 'force-dynamic'

export default async function BudgetPage() {
  const { supabase, organization } = await requireAppUser()
  const now = new Date()
  const currentDay = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const today = now.toISOString().slice(0, 10)

  const { data: summaries } = await supabase
    .from('daily_summaries')
    .select('date, total_cost_usd, engineers(team)')
    .eq('org_id', organization.id)
    .gte('date', monthStart)
    .lte('date', today)

  const rows = summaries ?? []
  const mtdSpend = rows.reduce((sum, row) => sum + row.total_cost_usd, 0)
  const dailyAverage = currentDay > 0 ? Math.round(mtdSpend / currentDay) : 0
  const projectedMonthEnd = dailyAverage * daysInMonth
  const isOverBudget = projectedMonthEnd > organization.monthly_budget

  const cumulativeByDay = new Map<number, number>()
  for (const row of rows) {
    const day = new Date(`${row.date}T12:00:00`).getDate()
    cumulativeByDay.set(day, (cumulativeByDay.get(day) ?? 0) + row.total_cost_usd)
  }
  let running = 0
  const forecastData = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    running += cumulativeByDay.get(day) ?? 0
    return {
      day: `${day}`,
      actual: day <= currentDay ? running : null,
      projected: day > currentDay ? dailyAverage * day : null,
    }
  })

  const teamTotals = new Map<string, number>()
  for (const row of rows) {
    const engineer = Array.isArray(row.engineers) ? row.engineers[0] : row.engineers
    const team = engineer?.team ?? 'Unassigned'
    teamTotals.set(team, (teamTotals.get(team) ?? 0) + row.total_cost_usd)
  }
  const teamRows = Array.from(teamTotals.entries()).sort((a, b) => b[1] - a[1])

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Budget</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
          Track real spending limits for your team
        </p>
      </div>

      {isOverBudget && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
        }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--red)', marginBottom: 4 }}>On pace to exceed budget</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Projected month-end spend: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>{formatCents(projectedMonthEnd)}</span>
            {' '}vs budget of <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCents(organization.monthly_budget)}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '24px' }}>
        <BudgetForecastChart
          data={forecastData}
          budgetCents={organization.monthly_budget}
        />

        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px' }}>Org Monthly Budget</h3>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '30px', fontWeight: 700 }}>
            {formatCents(organization.monthly_budget)}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '8px 0 0' }}>
            Budget editing can be added once billing and approval workflows are finalized.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Team Allocations</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Team</th>
              <th className="num">MTD Spend</th>
              <th className="num">Share</th>
              <th style={{ width: '160px' }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {teamRows.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: 'var(--muted)', fontSize: '13px', padding: '18px 24px' }}>
                  No team usage has been recorded yet.
                </td>
              </tr>
            )}
            {teamRows.map(([team, spend]) => {
              const pct = mtdSpend > 0 ? Math.round((spend / mtdSpend) * 100) : 0
              return (
                <tr key={team}>
                  <td style={{ fontWeight: 600 }}>{team}</td>
                  <td className="num" style={{ fontFamily: 'var(--font-mono)' }}>{formatCents(spend)}</td>
                  <td className="num" style={{ fontFamily: 'var(--font-mono)' }}>{pct}%</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--surface2)', borderRadius: '3px' }}>
                        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
