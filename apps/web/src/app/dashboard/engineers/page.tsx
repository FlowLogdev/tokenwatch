import Link from 'next/link'
import { formatCents, formatTokens } from '@/types'
import { requireAppUser } from '@/lib/authz'
import EngineerForm from '@/components/dashboard/EngineerForm'

export const dynamic = 'force-dynamic'

export default async function EngineersPage() {
  const { supabase, organization } = await requireAppUser()
  const from = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const to = new Date().toISOString().slice(0, 10)

  const [{ data: engineers }, { data: summaries }, { data: subscriptions }] = await Promise.all([
    supabase
      .from('engineers')
      .select('id, name, email, team, monthly_budget_override')
      .eq('org_id', organization.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('daily_summaries')
      .select('engineer_id, total_cost_usd, total_tokens, session_count')
      .eq('org_id', organization.id)
      .gte('date', from)
      .lte('date', to),
    supabase
      .from('tool_subscriptions')
      .select('engineer_id, monthly_cost_cents')
      .eq('org_id', organization.id)
      .eq('status', 'active'),
  ])

  const totals = new Map<string, { spend: number; tokens: number; sessions: number }>()
  for (const row of summaries ?? []) {
    const current = totals.get(row.engineer_id) ?? { spend: 0, tokens: 0, sessions: 0 }
    current.spend += row.total_cost_usd
    current.tokens += row.total_tokens
    current.sessions += row.session_count
    totals.set(row.engineer_id, current)
  }
  for (const row of subscriptions ?? []) {
    if (!row.engineer_id) continue
    const current = totals.get(row.engineer_id) ?? { spend: 0, tokens: 0, sessions: 0 }
    current.spend += row.monthly_cost_cents
    totals.set(row.engineer_id, current)
  }

  const rows = (engineers ?? [])
    .map(engineer => {
      const total = totals.get(engineer.id) ?? { spend: 0, tokens: 0, sessions: 0 }
      const budget = engineer.monthly_budget_override ?? organization.monthly_budget
      const pct = budget ? (total.spend / budget) * 100 : 0
      return {
        ...engineer,
        ...total,
        status: pct >= 90 ? 'alert' : pct >= 70 ? 'warning' : 'ok',
      }
    })
    .sort((a, b) => b.spend - a.spend)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Engineers</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
            Real tracked AI spend across your team
          </p>
        </div>
      </div>

      <EngineerForm />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Engineer</th>
              <th>Team</th>
              <th className="num">MTD Spend</th>
              <th className="num">Tokens</th>
              <th className="num">Sessions</th>
              <th>Status</th>
              <th style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ color: 'var(--muted)', fontSize: '13px', padding: '18px 24px' }}>
                  No engineers have been tracked yet. Usage appears here after the agent or API sends events.
                </td>
              </tr>
            )}
            {rows.map((eng, index) => (
              <tr key={eng.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '13px' }}>{index + 1}</td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{eng.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{eng.email}</div>
                </td>
                <td>
                  <span style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}>
                    {eng.team ?? 'Unassigned'}
                  </span>
                </td>
                <td className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600 }}>
                  {formatCents(eng.spend)}
                </td>
                <td className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)' }}>
                  {formatTokens(eng.tokens)}
                </td>
                <td className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)' }}>
                  {eng.sessions}
                </td>
                <td>
                  <span className={`status-${eng.status}`}>
                    {eng.status === 'ok' ? 'OK' : eng.status === 'warning' ? 'Warning' : 'Alert'}
                  </span>
                </td>
                <td>
                  <Link href={`/dashboard/engineers/${eng.id}`} style={{
                    fontSize: '13px',
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
