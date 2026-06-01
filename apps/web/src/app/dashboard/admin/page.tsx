import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAppUser, isSupportAdmin } from '@/lib/authz'
import { RegistrationAction } from './AdminActions'
import type { SupportTicket } from '@/types'

export const dynamic = 'force-dynamic'

type AdminOrg = {
  id: string
  name: string
  plan: string
  approval_status: string
  subscription_status: string
  created_at: string
  users?: Array<{ email: string; name: string }>
}

export default async function AdminPage() {
  const { profile } = await requireAppUser()

  if (!isSupportAdmin(profile)) {
    redirect('/dashboard')
  }

  const supabase = await createServiceClient()
  const [{ data: organizations }, { data: tickets }] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, plan, approval_status, subscription_status, created_at, users(email, name)')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('support_tickets')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(12),
  ])

  const pending = (organizations ?? []).filter(org => org.approval_status === 'pending')

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <p className="eyebrow">Flowlog admin</p>
        <h1 style={{ fontSize: 30, margin: '10px 0 6px' }}>Approvals and support queue</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>
          support@flowlog.dev has full admin access here.
        </p>
      </div>

      <div className="admin-grid">
        <section className="card">
          <h2 style={{ fontSize: 18, margin: '0 0 16px' }}>Customer approvals</h2>
          <div className="admin-list">
            {pending.length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>No pending approval requests.</p>}
            {(pending as AdminOrg[]).map(org => {
              const owner = Array.isArray(org.users) ? org.users[0] : null
              return (
                <article key={org.id} className="admin-row">
                  <div>
                    <strong>{org.name}</strong>
                    <p style={{ color: 'var(--muted)', margin: '4px 0 0', fontSize: 13 }}>
                      {owner?.name ?? 'Customer'} · {owner?.email ?? 'No email'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <RegistrationAction orgId={org.id} action="approve" />
                    <RegistrationAction orgId={org.id} action="deny" />
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="card">
          <h2 style={{ fontSize: 18, margin: '0 0 16px' }}>Recent tickets</h2>
          <div className="admin-list">
            {(tickets ?? []).length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>No support tickets yet.</p>}
            {((tickets ?? []) as SupportTicket[]).map(ticket => (
              <Link key={ticket.id} href={`/dashboard/admin/tickets/${ticket.id}`} className="admin-row" style={{ textDecoration: 'none', color: 'var(--text)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <strong>{ticket.ticket_number}</strong>
                  <span className="status-badge">{ticket.status}</span>
                </div>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>{ticket.subject}</span>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>{ticket.requester_email}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
