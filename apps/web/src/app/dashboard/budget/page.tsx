'use client'

import { useState } from 'react'
import { formatCents } from '@/types'
import { MOCK_KPI } from '@/lib/mock-data'
import BudgetForecastChart from '@/components/charts/BudgetForecastChart'

const TEAM_BUDGETS = [
  { team: 'Platform', budget: 60000, spend: 37120 },
  { team: 'Frontend', budget: 40000, spend: 27460 },
  { team: 'Backend', budget: 50000, spend: 23010 },
  { team: 'DevOps', budget: 20000, spend: 9870 },
  { team: 'ML', budget: 30000, spend: 6450 },
]

export default function BudgetPage() {
  const [orgBudget, setOrgBudget] = useState('2000')
  const projectedMonthEnd = Math.round(MOCK_KPI.mtdSpendCents * (30 / new Date().getDate()))
  const isOverBudget = projectedMonthEnd > MOCK_KPI.budgetTotalCents

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Budget</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
          Set and track spending limits for your team
        </p>
      </div>

      {isOverBudget && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '20px' }}>🚨</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--red)' }}>On pace to exceed budget</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Projected month-end spend: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>{formatCents(projectedMonthEnd)}</span>
              {' '}vs budget of <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCents(MOCK_KPI.budgetTotalCents)}</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '24px' }}>
        <BudgetForecastChart
          dailySpend={MOCK_KPI.mtdSpendCents / new Date().getDate()}
          budgetCents={MOCK_KPI.budgetTotalCents}
          currentDay={new Date().getDate()}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px' }}>Org Monthly Budget</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px' }}>$</span>
              <input
                className="input-field"
                type="number"
                value={orgBudget}
                onChange={e => setOrgBudget(e.target.value)}
                placeholder="2000"
              />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '8px 0 0' }}>
              Applies to all engineers unless overridden
            </p>
            <button className="btn-primary" style={{ marginTop: '16px', width: '100%', justifyContent: 'center', fontSize: '13px' }}>
              Save Budget
            </button>
          </div>
        </div>
      </div>

      {/* Team budgets */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Team Allocations</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Team</th>
              <th className="num">Budget</th>
              <th className="num">MTD Spend</th>
              <th className="num">Remaining</th>
              <th style={{ width: '160px' }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {TEAM_BUDGETS.map(row => {
              const pct = Math.round((row.spend / row.budget) * 100)
              const color = pct >= 80 ? 'var(--red)' : pct >= 50 ? 'var(--yellow)' : 'var(--accent)'
              return (
                <tr key={row.team}>
                  <td style={{ fontWeight: 600 }}>{row.team}</td>
                  <td className="num" style={{ fontFamily: 'var(--font-mono)' }}>{formatCents(row.budget)}</td>
                  <td className="num" style={{ fontFamily: 'var(--font-mono)' }}>{formatCents(row.spend)}</td>
                  <td className="num" style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{formatCents(row.budget - row.spend)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--surface2)', borderRadius: '3px' }}>
                        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color, minWidth: '36px' }}>{pct}%</span>
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
