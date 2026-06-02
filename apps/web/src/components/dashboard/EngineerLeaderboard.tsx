import Link from 'next/link'
import { formatCents, formatTokens } from '@/types'

interface Engineer {
  id: string
  rank: number
  name: string
  team: string
  spendCents: number
  tokens: number
  commits: number
  status: 'ok' | 'warning' | 'alert'
}

const STATUS_LABELS = { ok: 'OK', warning: 'Warning', alert: 'Alert' }

export default function EngineerLeaderboard({ engineers }: { engineers: Engineer[] }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Engineers</h3>
        <Link href="/dashboard/engineers" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
          View all →
        </Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>#</th>
            <th>Engineer</th>
            <th>Team</th>
            <th className="num">MTD Spend</th>
            <th className="num">Tokens</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {engineers.length === 0 && (
            <tr>
              <td colSpan={6} style={{ color: 'var(--muted)', fontSize: '13px', padding: '18px 24px' }}>
                No engineers have usage recorded yet.
              </td>
            </tr>
          )}
          {engineers.map(eng => (
            <tr key={eng.id}>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '13px' }}>{eng.rank}</td>
              <td>
                <Link href={`/dashboard/engineers/${eng.id}`} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500, fontSize: '14px' }}>
                  {eng.name}
                </Link>
              </td>
              <td style={{ color: 'var(--muted)', fontSize: '13px' }}>{eng.team}</td>
              <td className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{formatCents(eng.spendCents)}</td>
              <td className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)' }}>{formatTokens(eng.tokens)}</td>
              <td>
                <span className={`status-${eng.status}`}>{STATUS_LABELS[eng.status]}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
