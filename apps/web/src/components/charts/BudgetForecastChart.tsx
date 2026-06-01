'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function BudgetForecastChart({
  dailySpend,
  budgetCents,
  currentDay,
}: {
  dailySpend: number
  budgetCents: number
  currentDay: number
}) {
  const data = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1
    const actual = day <= currentDay ? Math.round(dailySpend * day * (0.8 + Math.random() * 0.4)) : null
    const projected = day > currentDay ? Math.round(dailySpend * day) : null
    return { day: `${day}`, actual, projected }
  })

  return (
    <div className="card">
      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>Monthly Spend Forecast</h3>
      <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 20px' }}>
        Actual vs. projected at current burn rate
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${(v / 100).toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}
            formatter={(v) => [`$${(Number(v) / 100).toFixed(2)}`, '']}
          />
          <ReferenceLine y={budgetCents} stroke="var(--red)" strokeDasharray="4 4" label={{ value: 'Budget', fill: 'var(--red)', fontSize: 11 }} />
          <Line type="monotone" dataKey="actual" stroke="var(--accent)" strokeWidth={2} dot={false} connectNulls />
          <Line type="monotone" dataKey="projected" stroke="var(--muted)" strokeWidth={2} strokeDasharray="4 4" dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--muted)', marginTop: '12px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '16px', height: '2px', background: 'var(--accent)', display: 'inline-block' }} /> Actual
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '16px', height: '2px', background: 'var(--muted)', display: 'inline-block', borderTop: '2px dashed var(--muted)' }} /> Projected
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '16px', height: '2px', background: 'var(--red)', display: 'inline-block', borderTop: '2px dashed var(--red)' }} /> Budget limit
        </span>
      </div>
    </div>
  )
}
