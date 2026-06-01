
export const MOCK_KPI = {
  mtdSpendCents: 124780,
  mtdSpendChange: 23.4,
  avgSpendPerEngineerCents: 8913,
  budgetUsedPct: 62,
  budgetRemainingCents: 75220,
  budgetTotalCents: 200000,
  aiCodeSharePct: 34,
  engineerCount: 14,
}

export const MOCK_DAILY_SPEND = Array.from({ length: 14 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (13 - i))
  const base = Math.random() * 4000 + 2000
  const isAnomaly = i === 9
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    spend: Math.round(isAnomaly ? base * 3.2 : base),
    isAnomaly,
  }
})

export const MOCK_TOOL_BREAKDOWN = [
  { tool: 'Claude Code', pct: 45, spendCents: 56151, color: '#f97316' },
  { tool: 'Cursor', pct: 28, spendCents: 34938, color: '#8b5cf6' },
  { tool: 'ChatGPT', pct: 16, spendCents: 19965, color: '#10b981' },
  { tool: 'Copilot', pct: 7, spendCents: 8735, color: '#3b82f6' },
  { tool: 'Codex', pct: 4, spendCents: 4991, color: '#6b7280' },
]

export const MOCK_ENGINEERS = [
  { id: '1', rank: 1, name: 'Alex Chen', team: 'Platform', spendCents: 23450, tokens: 1_840_000, commits: 47, status: 'alert' as const },
  { id: '2', rank: 2, name: 'Sarah Kim', team: 'Frontend', spendCents: 18920, tokens: 1_420_000, commits: 31, status: 'warning' as const },
  { id: '3', rank: 3, name: 'Marcus Johnson', team: 'Backend', spendCents: 15670, tokens: 1_180_000, commits: 38, status: 'ok' as const },
  { id: '4', rank: 4, name: 'Priya Patel', team: 'Platform', spendCents: 12340, tokens: 920_000, commits: 29, status: 'ok' as const },
  { id: '5', rank: 5, name: 'Tom Wilson', team: 'DevOps', spendCents: 9870, tokens: 740_000, commits: 22, status: 'ok' as const },
  { id: '6', rank: 6, name: 'Lisa Zhang', team: 'Frontend', spendCents: 8540, tokens: 640_000, commits: 19, status: 'ok' as const },
  { id: '7', rank: 7, name: 'James Park', team: 'Backend', spendCents: 7230, tokens: 540_000, commits: 15, status: 'ok' as const },
  { id: '8', rank: 8, name: 'Emma Davis', team: 'ML', spendCents: 6450, tokens: 490_000, commits: 12, status: 'ok' as const },
]

export const MOCK_ALERTS = [
  {
    id: '1',
    type: 'anomaly' as const,
    engineerName: 'Alex Chen',
    message: 'Spending 3.2x daily average today',
    timestamp: '2 hours ago',
    severity: 'high' as const,
  },
  {
    id: '2',
    type: 'budget' as const,
    engineerName: 'Sarah Kim',
    message: 'Hit 80% of monthly budget',
    timestamp: '5 hours ago',
    severity: 'medium' as const,
  },
  {
    id: '3',
    type: 'budget' as const,
    engineerName: 'Marcus Johnson',
    message: 'Hit 50% of monthly budget',
    timestamp: '1 day ago',
    severity: 'low' as const,
  },
  {
    id: '4',
    type: 'anomaly' as const,
    engineerName: 'Priya Patel',
    message: 'Spending 2.8x daily average',
    timestamp: '2 days ago',
    severity: 'medium' as const,
  },
]

export const MOCK_ENGINEER_DETAIL = {
  id: '1',
  name: 'Alex Chen',
  team: 'Platform',
  email: 'alex.chen@company.com',
  monthlyBudgetCents: 25000,
  spendCents: 23450,
  tokens: 1_840_000,
  sessionCount: 47,
  dailySpend: Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      spend: Math.round(Math.random() * 1200 + 400),
    }
  }),
  toolBreakdown: [
    { tool: 'Claude Code', pct: 72, spendCents: 16884, color: '#f97316' },
    { tool: 'Cursor', pct: 18, spendCents: 4221, color: '#8b5cf6' },
    { tool: 'ChatGPT', pct: 10, spendCents: 2345, color: '#10b981' },
  ],
  sessions: [
    { date: 'Jun 1', tool: 'Claude Code', duration: '2h 14m', cost: 1840, tokens: 142000 },
    { date: 'Jun 1', tool: 'Cursor', duration: '45m', cost: 620, tokens: 48000 },
    { date: 'May 31', tool: 'Claude Code', duration: '3h 02m', cost: 2490, tokens: 192000 },
    { date: 'May 31', tool: 'ChatGPT', duration: '1h 20m', cost: 980, tokens: 76000 },
    { date: 'May 30', tool: 'Claude Code', duration: '1h 45m', cost: 1420, tokens: 110000 },
  ],
}
