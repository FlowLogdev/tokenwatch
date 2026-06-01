import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAppUser, isSupportAdmin } from '@/lib/authz'
import type { SupportTicket } from '@/types'

export const dynamic = 'force-dynamic'

export default async function CustomerTicketsPage() {
  const { profile } = await requireAppUser()
  const supabase = await createServiceClient()
  const admin = isSupportAdmin(profile)
  const query = supabase
    .from('support_tickets')
    .select('*')
    .order('updated_at', { ascending: false })

  const { data: tickets } = admin
    ? await query.limit(50)
    : await query.or(`org_id.eq.${profile.org_id},requester_email.eq.${profile.email}`)

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center' }}>
        <div>
          <p className="eyebrow">Support</p>
          <h1 style={{ fontSize: 30, margin: '10px 0 6px' }}>Tickets</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Track every open request and update.</p>
        </div>
        <Link href="/support" className="btn-primary">New ticket</Link>
      </div>

      <div className="admin-list">
        {(tickets ?? []).length === 0 && (
          <div className="card">
            <p style={{ color: 'var(--muted)', margin: 0 }}>No tickets yet.</p>
          </div>
        )}
        {((tickets ?? []) as SupportTicket[]).map(ticket => {
          const unread = ticket.last_customer_read_at && new Date(ticket.updated_at) > new Date(ticket.last_customer_read_at)
          return (
            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className="admin-row" style={{ color: 'var(--text)', textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <strong>{ticket.ticket_number}</strong>
                <div style={{ display: 'flex', gap: 8 }}>
                  {unread && <span className="status-badge" style={{ color: 'var(--accent)' }}>updated</span>}
                  <span className="status-badge">{ticket.status}</span>
                </div>
              </div>
              <span>{ticket.subject}</span>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>{ticket.requester_email}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
