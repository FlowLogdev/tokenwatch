import KpiCards from '@/components/dashboard/KpiCards'
import SpendChart from '@/components/charts/SpendChart'
import BudgetRing from '@/components/charts/BudgetRing'
import ToolBreakdown from '@/components/charts/ToolBreakdown'
import EngineerLeaderboard from '@/components/dashboard/EngineerLeaderboard'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import { requireAppUser } from '@/lib/authz'

const TOOL_COLORS: Record<string, string> = {
  claude_code: '#d76f36',
  cursor: '#8b5cf6',
  chatgpt: '#10b981',
  copilot: '#3b82f6',
  codex: '#9ca3af',
  custom: '#eab308',
}

const TOOL_LABELS: Record<string, string> = {
  claude_code: 'Claude Code',
  cursor: 'Cursor',
  chatgpt: 'ChatGPT',
  copilot: 'Copilot',
  codex: 'Codex',
  custom: 'Custom',
}

type AlertRow = {
  id: string
  threshold_pct: number
  triggered_at: string
  engineers: { name: string | null } | { name: string | null }[] | null
}

function toDayLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function DashboardPage() {
  const { supabase, organization } = await requireAppUser()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const priorMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const priorMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  const from = monthStart.toISOString().slice(0, 10)
  const to = now.toISOString().slice(0, 10)

  const [{ data: summaries }, { data: priorSummaries }, { data: engineers }, { data: alerts }] = await Promise.all([
    supabase
      .from('daily_summaries')
      .select('engineer_id, tool, date, total_tokens, total_cost_usd')
      .eq('org_id', organization.id)
      .gte('date', from)
      .lte('date', to),
    supabase
      .from('daily_summaries')
      .select('total_cost_usd')
      .eq('org_id', organization.id)
      .gte('date', priorMonthStart.toISOString().slice(0, 10))
      .lte('date', priorMonthEnd.toISOString().slice(0, 10)),
    supabase
      .from('engineers')
      .select('id, name, email, team, monthly_budget_override')
      .eq('org_id', organization.id),
    supabase
      .from('budget_alerts')
      .select('id, engineer_id, threshold_pct, triggered_at, spend_at_trigger, engineers(name)')
      .eq('org_id', organization.id)
      .order('triggered_at', { ascending: false })
      .limit(5),
  ])

  const rows = summaries ?? []
  const totalSpend = rows.reduce((sum, row) => sum + row.total_cost_usd, 0)
  const totalTokens = rows.reduce((sum, row) => sum + row.total_tokens, 0)
  const priorSpend = (priorSummaries ?? []).reduce((sum, row) => sum + row.total_cost_usd, 0)
  const change = priorSpend > 0 ? ((totalSpend - priorSpend) / priorSpend) * 100 : 0
  const engineerCount = engineers?.length ?? 0
  const budgetTotal = organization.monthly_budget ?? 0
  const budgetUsedPct = budgetTotal > 0 ? Math.min(100, Math.round((totalSpend / budgetTotal) * 100)) : 0

  const dailyMap = new Map<string, number>()
  for (const row of rows) {
    dailyMap.set(row.date, (dailyMap.get(row.date) ?? 0) + row.total_cost_usd)
  }
  const dailySpend = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(now)
    day.setDate(day.getDate() - (13 - index))
    const key = day.toISOString().slice(0, 10)
    const spend = dailyMap.get(key) ?? 0
    const values = Array.from(dailyMap.values())
    const avg = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
    return {
      date: toDayLabel(key),
      spend,
      isAnomaly: avg > 0 && spend > avg * 2.5,
    }
  })

  const toolTotals = new Map<string, number>()
  for (const row of rows) {
    toolTotals.set(row.tool, (toolTotals.get(row.tool) ?? 0) + row.total_cost_usd)
  }
  const toolBreakdown = Array.from(toolTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tool, spendCents]) => ({
      tool: TOOL_LABELS[tool] ?? tool,
      pct: totalSpend > 0 ? Math.round((spendCents / totalSpend) * 100) : 0,
      spendCents,
      color: TOOL_COLORS[tool] ?? TOOL_COLORS.custom,
    }))

  const engineerTotals = new Map<string, { spendCents: number; tokens: number }>()
  for (const row of rows) {
    const current = engineerTotals.get(row.engineer_id) ?? { spendCents: 0, tokens: 0 }
    current.spendCents += row.total_cost_usd
    current.tokens += row.total_tokens
    engineerTotals.set(row.engineer_id, current)
  }
  const leaderboard = (engineers ?? [])
    .map(engineer => {
      const totals = engineerTotals.get(engineer.id) ?? { spendCents: 0, tokens: 0 }
      const budget = engineer.monthly_budget_override ?? organization.monthly_budget
      const pct = budget ? (totals.spendCents / budget) * 100 : 0
      return {
        id: engineer.id,
        rank: 0,
        name: engineer.name,
        team: engineer.team ?? 'Admin',
        spendCents: totals.spendCents,
        tokens: totals.tokens,
        commits: 0,
        status: pct >= 90 ? 'alert' as const : pct >= 70 ? 'warning' as const : 'ok' as const,
      }
    })
    .sort((a, b) => b.spendCents - a.spendCents)
    .map((engineer, index) => ({ ...engineer, rank: index + 1 }))

  const kpi = {
    mtdSpendCents: totalSpend,
    mtdSpendChange: change,
    avgSpendPerEngineerCents: engineerCount > 0 ? Math.round(totalSpend / engineerCount) : 0,
    budgetUsedPct,
    budgetRemainingCents: Math.max(0, budgetTotal - totalSpend),
    budgetTotalCents: budgetTotal,
    aiCodeSharePct: totalTokens > 0 ? 100 : 0,
    engineerCount,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <KpiCards data={kpi} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
        <SpendChart data={dailySpend} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <BudgetRing used={budgetUsedPct} remaining={kpi.budgetRemainingCents} total={budgetTotal} />
          <ToolBreakdown data={toolBreakdown} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <EngineerLeaderboard engineers={leaderboard} />
        <AlertsPanel alerts={((alerts ?? []) as AlertRow[]).map(alert => {
          const engineerName = Array.isArray(alert.engineers)
            ? alert.engineers[0]?.name
            : alert.engineers?.name
          const threshold = alert.threshold_pct
          return {
            id: alert.id,
            type: threshold === -1 ? 'anomaly' as const : 'budget' as const,
            engineerName: engineerName ?? 'Unknown engineer',
            message: threshold === -1
              ? 'Spending anomaly detected'
              : `Reached ${threshold}% of monthly budget`,
            timestamp: new Date(alert.triggered_at).toLocaleString(),
            severity: threshold >= 100 || threshold === -1 ? 'high' as const : threshold >= 80 ? 'medium' as const : 'low' as const,
          }
        })} />
      </div>
    </div>
  )
}
