'use client'

import { formatCents } from '@/types'

interface KpiData {
  mtdSpendCents: number
  mtdSpendChange: number
  avgSpendPerEngineerCents: number
  budgetUsedPct: number
  budgetRemainingCents: number
  budgetTotalCents: number
  aiCodeSharePct: number
  engineerCount: number
}

export default function KpiCards({ data }: { data: KpiData }) {
  const cards = [
    {
      label: 'MTD Spend',
      value: formatCents(data.mtdSpendCents),
      sub: `${data.mtdSpendChange > 0 ? '+' : ''}${data.mtdSpendChange.toFixed(1)}% vs last month`,
      subColor: data.mtdSpendChange > 0 ? 'var(--red)' : 'var(--green)',
      icon: '💸',
    },
    {
      label: 'Avg / Engineer',
      value: formatCents(data.avgSpendPerEngineerCents),
      sub: `${data.engineerCount} engineers tracked`,
      subColor: 'var(--muted)',
      icon: '👤',
    },
    {
      label: 'Budget Used',
      value: `${data.budgetUsedPct}%`,
      sub: `${formatCents(data.budgetRemainingCents)} remaining of ${formatCents(data.budgetTotalCents)}`,
      subColor: data.budgetUsedPct >= 80 ? 'var(--red)' : data.budgetUsedPct >= 50 ? 'var(--yellow)' : 'var(--muted)',
      icon: data.budgetUsedPct >= 80 ? '🚨' : '📊',
    },
    {
      label: 'AI Code Share',
      value: `${data.aiCodeSharePct}%`,
      sub: 'of commits touch AI-assisted files',
      subColor: 'var(--muted)',
      icon: '🤖',
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
    }}>
      {cards.map(card => (
        <div key={card.label} className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {card.label}
            </span>
            <span style={{ fontSize: '20px' }}>{card.icon}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
            {card.value}
          </div>
          <div style={{ fontSize: '12px', color: card.subColor }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
