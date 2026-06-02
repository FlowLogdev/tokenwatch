import Link from 'next/link'
import { redirect } from 'next/navigation'
import { formatCents, formatTokens } from '@/types'
import EngineerSpendChart from '@/components/charts/EngineerSpendChart'
import { requireAppUser } from '@/lib/authz'

const TOOL_LABELS: Record<string, string> = {
  claude_code: 'Claude Code',
  cursor: 'Cursor',
  chatgpt: 'ChatGPT',
  copilot: 'Copilot',
  codex: 'Codex',
  custom: 'Custom',
}

const TOOL_COLORS: Record<string, string> = {
  claude_code: '#d76f36',
  cursor: '#8b5cf6',
  chatgpt: '#10b981',
  copilot: '#3b82f6',
  codex: '#9ca3af',
  custom: '#eab308',
}

function dayLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const dynamic = 'force-dynamic'

export default async function EngineerDetailPage({ params }: { params: { id: string } }) {
  const { supabase, organization } = await requireAppUser()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const today = now.toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

  const [{ data: engineer }, { data: summaries }, { data: events }] = await Promise.all([
    supabase
      .from('engineers')
      .select('id, name, email, team, monthly_budget_override')
      .eq('org_id', organization.id)
      .eq('id', params.id)
      .single(),
    supabase
      .from('daily_summaries')
      .select('date, tool, total_cost_usd, total_tokens, session_count')
      .eq('org_id', organization.id)
      .eq('engineer_id', params.id)
      .gte('date', monthStart)
      .lte('date', today),
    supabase
      .from('usage_events')
      .select('id, timestamp, tool, model, input_tokens, output_tokens, cost_usd')
      .eq('org_id', organization.id)
      .eq('engineer_id', params.id)
      .order('timestamp', { ascending: false })
      .limit(25),
  ])

  if (!engineer) {
    redirect('/dashboard/engineers')
  }

  const spendCents = (summaries ?? []).reduce((sum, row) => sum + row.total_cost_usd, 0)
  const tokens = (summaries ?? []).reduce((sum, row) => sum + row.total_tokens, 0)
  const sessionCount = (summaries ?? []).reduce((sum, row) => sum + row.session_count, 0)
  const monthlyBudgetCents = engineer.monthly_budget_override ?? organization.monthly_budget
  const budgetPct = monthlyBudgetCents > 0 ? Math.round((spendCents / monthlyBudgetCents) * 100) : 0

  const spendByDay = new Map<string, number>()
  for (const row of summaries ?? []) {
    spendByDay.set(row.date, (spendByDay.get(row.date) ?? 0) + row.total_cost_usd)
  }
  const dailySpend = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(thirtyDaysAgo)
    date.setDate(thirtyDaysAgo.getDate() + index)
    const key = date.toISOString().slice(0, 10)
    return { date: dayLabel(key), spend: spendByDay.get(key) ?? 0 }
  })

  const toolTotals = new Map<string, number>()
  for (const row of summaries ?? []) {
    toolTotals.set(row.tool, (toolTotals.get(row.tool) ?? 0) + row.total_cost_usd)
  }
  const toolBreakdown = Array.from(toolTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tool, spend]) => ({
      tool: TOOL_LABELS[tool] ?? tool,
      pct: spendCents > 0 ? Math.round((spend / spendCents) * 100) : 0,
      color: TOOL_COLORS[tool] ?? TOOL_COLORS.custom,
    }))

  return (
    <div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>
        <Link href="/dashboard/engineers" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Engineers</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text)' }}>{engineer.name}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px' }}>{engineer.name}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
            {engineer.team ?? 'Unassigned'} · {engineer.email}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'MTD Spend', value: formatCents(spendCents), sub: `${budgetPct}% of budget`, color: budgetPct >= 80 ? 'var(--red)' : 'var(--muted)' },
          { label: 'Monthly Budget', value: formatCents(monthlyBudgetCents), sub: `${formatCents(Math.max(0, monthlyBudgetCents - spendCents))} remaining`, color: 'var(--green)' },
          { label: 'Total Tokens', value: formatTokens(tokens), sub: 'this month', color: 'var(--muted)' },
          { label: 'Sessions', value: String(sessionCount), sub: 'this month', color: 'var(--muted)' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '24px', marginBottom: '24px' }}>
        <EngineerSpendChart data={dailySpend} />
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 16px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            By Tool
          </h3>
          {toolBreakdown.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>No tool usage recorded.</p>
          )}
          {toolBreakdown.map(t => (
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

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Recent Sessions</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Tool</th>
              <th>Model</th>
              <th className="num">Cost</th>
              <th className="num">Tokens</th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: 'var(--muted)', fontSize: '13px', padding: '18px 24px' }}>
                  No usage events recorded for this engineer yet.
                </td>
              </tr>
            )}
            {(events ?? []).map(session => (
              <tr key={session.id}>
                <td style={{ fontSize: '13px' }}>{new Date(session.timestamp).toLocaleString()}</td>
                <td>
                  <span style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '12px',
                  }}>
                    {TOOL_LABELS[session.tool] ?? session.tool}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)' }}>{session.model}</td>
                <td className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{formatCents(session.cost_usd)}</td>
                <td className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)' }}>{formatTokens(session.input_tokens + session.output_tokens)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
