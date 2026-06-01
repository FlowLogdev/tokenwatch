import Link from 'next/link'
import { redirect } from 'next/navigation'
import TicketReplyForm from '@/components/TicketReplyForm'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAppUser, isSupportAdmin } from '@/lib/authz'
import type { SupportTicketMessage } from '@/types'

export const dynamic = 'force-dynamic'

export default async function CustomerTicketDetail({ params }: { params: { ticketId: string } }) {
  const { profile } = await requireAppUser()
  const supabase = await createServiceClient()
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', params.ticketId)
    .single()

  if (!ticket) {
    redirect('/dashboard/tickets')
  }

  const admin = isSupportAdmin(profile)
  if (!admin && ticket.org_id !== profile.org_id && ticket.requester_email.toLowerCase() !== profile.email.toLowerCase()) {
    redirect('/dashboard/tickets')
  }

  await supabase
    .from('support_tickets')
    .update({ last_customer_read_at: new Date().toISOString() })
    .eq('id', ticket.id)

  const { data: messages } = await supabase
    .from('support_ticket_messages')
    .select('*')
    .eq('ticket_id', ticket.id)
    .order('created_at', { ascending: true })

  return (
    <div style={{ maxWidth: 860, display: 'grid', gap: 20 }}>
      <Link href="/dashboard/tickets" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 13 }}>Back to tickets</Link>
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start' }}>
          <div>
            <span className="status-badge">{ticket.status}</span>
            <h1 style={{ fontSize: 28, margin: '14px 0 8px' }}>{ticket.subject}</h1>
            <p style={{ color: 'var(--muted)', margin: 0 }}>{ticket.ticket_number} · {ticket.requester_email}</p>
          </div>
        </div>
      </section>

      <section className="card" style={{ display: 'grid', gap: 14 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Progress</h2>
        {((messages ?? []) as SupportTicketMessage[]).map(message => (
          <article key={message.id} style={{
            padding: 14,
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: message.is_admin ? 'var(--accent-muted)' : 'var(--surface2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
              <strong>{message.author_name}</strong>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{new Date(message.created_at).toLocaleString()}</span>
            </div>
            <p style={{ margin: 0, color: message.is_admin ? 'var(--text)' : 'var(--muted)', lineHeight: 1.65 }}>{message.body}</p>
          </article>
        ))}
      </section>

      <section className="card">
        <h2 style={{ fontSize: 18, margin: '0 0 16px' }}>Add an update</h2>
        <TicketReplyForm ticketId={ticket.id} />
      </section>
    </div>
  )
}
