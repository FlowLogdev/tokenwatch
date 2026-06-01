import Link from 'next/link'
import { formatCents, formatTokens } from '@/types'
import { MOCK_ENGINEERS } from '@/lib/mock-data'

export default function EngineersPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Engineers</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
            Track AI spend across your team
          </p>
        </div>
        <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
          + Invite Engineer
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input className="input-field" placeholder="Search engineers..." style={{ maxWidth: '280px' }} />
        <select className="input-field" style={{ maxWidth: '140px' }}>
          <option>All teams</option>
          <option>Platform</option>
          <option>Frontend</option>
          <option>Backend</option>
          <option>DevOps</option>
          <option>ML</option>
        </select>
        <select className="input-field" style={{ maxWidth: '140px' }}>
          <option>All tools</option>
          <option>Claude Code</option>
          <option>Cursor</option>
          <option>ChatGPT</option>
          <option>Copilot</option>
        </select>
        <select className="input-field" style={{ maxWidth: '140px' }}>
          <option>All statuses</option>
          <option>OK</option>
          <option>Warning</option>
          <option>Alert</option>
        </select>
      </div>

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
            {MOCK_ENGINEERS.map(eng => (
              <tr key={eng.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '13px' }}>{eng.rank}</td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{eng.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{eng.team}</div>
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
                    {eng.team}
                  </span>
                </td>
                <td className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600 }}>
                  {formatCents(eng.spendCents)}
                </td>
                <td className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)' }}>
                  {formatTokens(eng.tokens)}
                </td>
                <td className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)' }}>
                  {eng.commits}
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
                    View →
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
