import { MOCK_TOOL_BREAKDOWN } from '@/lib/mock-data'
import { formatCents } from '@/types'

const TOOL_INFO = {
  'Claude Code': { desc: 'Anthropic\'s AI coding assistant. Tracks via ~/.claude/logs/ watcher.', status: 'active' },
  'Cursor': { desc: 'AI-first code editor. Tracks via OpenAI proxy on port 9099.', status: 'active' },
  'ChatGPT': { desc: 'OpenAI\'s chat interface. Tracks via API proxy when using API key.', status: 'active' },
  'Copilot': { desc: 'GitHub Copilot. Tracks via VS Code extension integration.', status: 'inactive' },
  'Codex': { desc: 'OpenAI Codex API. Tracks via proxy mode.', status: 'active' },
}

export default function ToolsPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Tools</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
          AI tools being tracked and their usage breakdown
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {MOCK_TOOL_BREAKDOWN.map(tool => {
          const info = TOOL_INFO[tool.tool as keyof typeof TOOL_INFO]
          return (
            <div key={tool.tool} className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                width: '48px', height: '48px',
                background: tool.color + '22',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: tool.color, display: 'block' }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>{tool.tool}</span>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.04em', padding: '2px 8px', borderRadius: '4px',
                    background: info?.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(107,107,120,0.15)',
                    color: info?.status === 'active' ? 'var(--green)' : 'var(--muted)',
                  }}>
                    {info?.status ?? 'Unknown'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                  {info?.desc ?? 'AI tool'}
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
          )
        })}
      </div>
    </div>
  )
}
