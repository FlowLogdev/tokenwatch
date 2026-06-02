import { formatCents } from '@/types'
import { requireAppUser } from '@/lib/authz'
import ToolSubscriptionForm from '@/components/dashboard/ToolSubscriptionForm'

const TOOL_INFO: Record<string, { label: string; desc: string; status: string; color: string }> = {
  claude_code: { label: 'Claude Code', desc: 'Tracked by the local TokenWatch agent when Claude log files are available.', status: 'active', color: '#d76f36' },
  cursor: { label: 'Cursor', desc: 'Tracked when API usage flows through the TokenWatch proxy or ingestion API.', status: 'active', color: '#8b5cf6' },
  chatgpt: { label: 'ChatGPT', desc: 'Tracked through OpenAI-compatible API usage sent to TokenWatch.', status: 'active', color: '#10b981' },
  copilot: { label: 'Copilot', desc: 'Available through direct API ingestion when usage events are provided.', status: 'available', color: '#3b82f6' },
  codex: { label: 'Codex', desc: 'Tracked through OpenAI-compatible API usage sent to TokenWatch.', status: 'active', color: '#9ca3af' },
  custom: { label: 'Custom', desc: 'Tracked through the TokenWatch ingestion API.', status: 'active', color: '#eab308' },
}

export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
  const { supabase, organization } = await requireAppUser()
  const from = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const to = new Date().toISOString().slice(0, 10)
  const [{ data: summaries }, { data: subscriptions }, { data: engineers }] = await Promise.all([
    supabase
      .from('daily_summaries')
      .select('tool, total_cost_usd')
      .eq('org_id', organization.id)
      .gte('date', from)
      .lte('date', to),
    supabase
      .from('tool_subscriptions')
      .select('id, tool, plan_name, monthly_cost_cents, renewal_day, status, notes, engineers(name, email)')
      .eq('org_id', organization.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('engineers')
      .select('id, name, email')
      .eq('org_id', organization.id)
      .order('name'),
  ])

  const subscriptionsRows = (subscriptions ?? []) as Array<{
    id: string
    tool: string
    plan_name: string
    monthly_cost_cents: number
    renewal_day: number | null
    status: 'active' | 'paused' | 'canceled'
    notes: string | null
    engineers: { name: string | null; email: string | null } | { name: string | null; email: string | null }[] | null
  }>
  const activeSubscriptions = subscriptionsRows.filter(row => row.status === 'active')
  const subscriptionTotal = activeSubscriptions.reduce((sum, row) => sum + row.monthly_cost_cents, 0)
  const usageTotal = (summaries ?? []).reduce((sum, row) => sum + row.total_cost_usd, 0)
  const totalSpend = usageTotal + subscriptionTotal
  const totals = new Map<string, { usage: number; subscriptions: number }>()
  for (const row of summaries ?? []) {
    const current = totals.get(row.tool) ?? { usage: 0, subscriptions: 0 }
    current.usage += row.total_cost_usd
    totals.set(row.tool, current)
  }
  for (const row of activeSubscriptions) {
    const current = totals.get(row.tool) ?? { usage: 0, subscriptions: 0 }
    current.subscriptions += row.monthly_cost_cents
    totals.set(row.tool, current)
  }
  const rows = Array.from(totals.entries())
    .sort((a, b) => (b[1].usage + b[1].subscriptions) - (a[1].usage + a[1].subscriptions))
    .map(([tool, spend]) => {
      const info = TOOL_INFO[tool] ?? TOOL_INFO.custom
      const spendCents = spend.usage + spend.subscriptions
      return {
        tool,
        label: info.label,
        desc: info.desc,
        status: info.status,
        color: info.color,
        spendCents,
        usageCents: spend.usage,
        subscriptionCents: spend.subscriptions,
        pct: totalSpend > 0 ? Math.round((spendCents / totalSpend) * 100) : 0,
      }
    })

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Tools</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
          Real AI tool usage tracked this month
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '20px', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '16px' }}>
        {rows.length === 0 && (
          <div className="card" style={{ color: 'var(--muted)', fontSize: '14px' }}>
            No tool usage or subscriptions have been recorded yet.
          </div>
        )}
        {rows.map(tool => (
          <div key={tool.tool} className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{
              width: '48px', height: '48px',
              background: tool.color + '22',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: tool.color, display: 'block' }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>{tool.label}</span>
                <span style={{
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.04em', padding: '2px 8px', borderRadius: '4px',
                  background: tool.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(107,107,120,0.15)',
                  color: tool.status === 'active' ? 'var(--green)' : 'var(--muted)',
                }}>
                  {tool.status}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                {tool.desc}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700 }}>
                  {formatCents(tool.spendCents)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {formatCents(tool.usageCents)} usage + {formatCents(tool.subscriptionCents)} subscriptions
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: tool.color }}>
                  {tool.pct}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>of total</div>
              </div>
            </div>
          </div>
        ))}
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <ToolSubscriptionForm engineers={(engineers ?? []).map(engineer => ({
            id: engineer.id,
            name: engineer.name,
            email: engineer.email,
          }))} />

          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 12px' }}>Active Subscriptions</h2>
            {subscriptionsRows.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                No fixed tool subscriptions have been added yet.
              </p>
            )}
            <div style={{ display: 'grid', gap: '10px' }}>
              {subscriptionsRows.map(subscription => {
                const info = TOOL_INFO[subscription.tool] ?? TOOL_INFO.custom
                const engineer = Array.isArray(subscription.engineers)
                  ? subscription.engineers[0]
                  : subscription.engineers
                return (
                  <div key={subscription.id} style={{
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px',
                    background: 'var(--surface2)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px' }}>{info.label}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: 3 }}>
                          {subscription.plan_name}
                          {engineer?.name ? ` · ${engineer.name}` : ' · Organization level'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{formatCents(subscription.monthly_cost_cents)}</div>
                        <div style={{ color: subscription.status === 'active' ? 'var(--green)' : 'var(--muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800 }}>
                          {subscription.status}
                        </div>
                      </div>
                    </div>
                    {(subscription.renewal_day || subscription.notes) && (
                      <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '8px', lineHeight: 1.5 }}>
                        {subscription.renewal_day ? `Renews day ${subscription.renewal_day}. ` : ''}
                        {subscription.notes ?? ''}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
