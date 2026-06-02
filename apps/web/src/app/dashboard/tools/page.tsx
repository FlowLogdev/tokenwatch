import { formatCents } from '@/types'
import { requireAppUser } from '@/lib/authz'

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
  const { data: summaries } = await supabase
    .from('daily_summaries')
    .select('tool, total_cost_usd')
    .eq('org_id', organization.id)
    .gte('date', from)
    .lte('date', to)

  const totalSpend = (summaries ?? []).reduce((sum, row) => sum + row.total_cost_usd, 0)
  const totals = new Map<string, number>()
  for (const row of summaries ?? []) {
    totals.set(row.tool, (totals.get(row.tool) ?? 0) + row.total_cost_usd)
  }
  const rows = Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tool, spendCents]) => {
      const info = TOOL_INFO[tool] ?? TOOL_INFO.custom
      return {
        tool,
        label: info.label,
        desc: info.desc,
        status: info.status,
        color: info.color,
        spendCents,
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

      <div style={{ display: 'grid', gap: '16px' }}>
        {rows.length === 0 && (
          <div className="card" style={{ color: 'var(--muted)', fontSize: '14px' }}>
            No tool usage has been recorded yet.
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
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>MTD spend</div>
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
    </div>
  )
}
