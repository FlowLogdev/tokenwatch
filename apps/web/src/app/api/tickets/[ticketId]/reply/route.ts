import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAppUser, isSupportAdmin } from '@/lib/authz'
import { emailFrame, sendEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { ticketId: string } }) {
  const { profile } = await requireAppUser()
  const body = await req.json().catch(() => null)

  if (!body?.message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', params.ticketId)
    .single()

  if (error || !ticket) {
    return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
  }

  const admin = isSupportAdmin(profile)
  if (!admin && ticket.org_id !== profile.org_id && ticket.requester_email.toLowerCase() !== profile.email.toLowerCase()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const nextStatus = admin ? (body.status ?? 'in_progress') : 'open'
  await supabase.from('support_ticket_messages').insert({
    ticket_id: ticket.id,
    author_user_id: profile.id,
    author_email: profile.email,
    author_name: profile.name,
    is_admin: admin,
    body: body.message,
  })

  await supabase
    .from('support_tickets')
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
      last_admin_read_at: admin ? new Date().toISOString() : ticket.last_admin_read_at,
      last_customer_read_at: admin ? ticket.last_customer_read_at : new Date().toISOString(),
    })
    .eq('id', ticket.id)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin
  const recipient = admin ? ticket.requester_email : 'support@flowlog.dev'
  await sendEmail({
    to: recipient,
    subject: `Ticket ${ticket.ticket_number} updated`,
    html: emailFrame(
      `Ticket ${ticket.ticket_number} was updated`,
      `
        <p><strong>${profile.name}</strong> added an update:</p>
        <p>${body.message}</p>
        <p><a href="${siteUrl}/dashboard/tickets" style="display:inline-block;background:#d76f36;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:700;">View ticket</a></p>
      `
    ),
  })

  return NextResponse.json({ ok: true })
}
