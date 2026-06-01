'use client'

import { formatCentsShort } from '@/types'

interface ToolData {
  tool: string
  pct: number
  spendCents: number
  color: string
}

export default function ToolBreakdown({ data }: { data: ToolData[] }) {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 16px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        By Tool
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.map(item => (
          <div key={item.tool}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
              <span style={{ fontWeight: 500 }}>{item.tool}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '12px' }}>
                {formatCentsShort(item.spendCents)} · {item.pct}%
              </span>
            </div>
            <div style={{
              height: '4px',
              background: 'var(--surface2)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${item.pct}%`,
                height: '100%',
                background: item.color,
                borderRadius: '2px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
