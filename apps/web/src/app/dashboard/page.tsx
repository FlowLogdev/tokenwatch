import KpiCards from '@/components/dashboard/KpiCards'
import SpendChart from '@/components/charts/SpendChart'
import BudgetRing from '@/components/charts/BudgetRing'
import ToolBreakdown from '@/components/charts/ToolBreakdown'
import EngineerLeaderboard from '@/components/dashboard/EngineerLeaderboard'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import { MOCK_DAILY_SPEND, MOCK_ENGINEERS, MOCK_ALERTS, MOCK_TOOL_BREAKDOWN, MOCK_KPI } from '@/lib/mock-data'

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <KpiCards data={MOCK_KPI} />

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
        <SpendChart data={MOCK_DAILY_SPEND} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <BudgetRing used={MOCK_KPI.budgetUsedPct} remaining={MOCK_KPI.budgetRemainingCents} total={MOCK_KPI.budgetTotalCents} />
          <ToolBreakdown data={MOCK_TOOL_BREAKDOWN} />
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <EngineerLeaderboard engineers={MOCK_ENGINEERS} />
        <AlertsPanel alerts={MOCK_ALERTS} />
      </div>
    </div>
  )
}
