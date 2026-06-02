'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCents } from '@/types'

export default function BudgetRing({
  used,
  remaining,
  total,
}: {
  used: number
  remaining: number
  total: number
}) {
  const color = used >= 80 ? 'var(--red)' : used >= 50 ? 'var(--yellow)' : 'var(--accent)'
  const visibleUsed = Math.max(0, Math.min(100, used))
  const data = [
    { value: visibleUsed },
    { value: Math.max(0, 100 - visibleUsed) },
  ]

  return (
    <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Budget
      </h3>
      <div style={{ position: 'relative', height: '120px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={52}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              dataKey="value"
            >
              <Cell fill={color} />
              <Cell fill="var(--surface2)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color }}>{used}%</div>
          <div style={{ fontSize: '10px', color: 'var(--muted)' }}>used</div>
        </div>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
        <span style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCents(remaining)}</span>
        {' remaining of '}
        <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCents(total)}</span>
      </div>
    </div>
  )
}
