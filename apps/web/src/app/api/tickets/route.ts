import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL, emailFrame, sendEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

function ticketNumber() {
  const stamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `TW-${stamp}-${random}`
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body?.name || !body?.email || !body?.subject || !body?.description) {
    return NextResponse.json({ error: 'Name, email, subject, and description are required.' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data: customer } = await supabase
    .from('users')
    .select('id, org_id, email, name')
    .ilike('email', body.email)
    .maybeSingle()

  const number = ticketNumber()
  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({
      ticket_number: number,
      org_id: customer?.org_id ?? null,
      user_id: customer?.id ?? null,
      requester_name: body.name,
      requester_email: body.email,
      company: body.company || null,
      subject: body.subject,
      description: body.description,
      priority: body.priority ?? 'normal',
    })
    .select('*')
    .single()

  if (error || !ticket) {
    return NextResponse.json({ error: error?.message ?? 'Could not create ticket.' }, { status: 500 })
  }

  await supabase.from('support_ticket_messages').insert({
    ticket_id: ticket.id,
    author_user_id: customer?.id ?? null,
    author_email: body.email,
    author_name: body.name,
    is_admin: false,
    body: body.description,
  })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin
  await Promise.all([
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `Support ticket ${number}: ${body.subject}`,
      html: emailFrame(
        `New support ticket ${number}`,
        `
          <p><strong>Customer:</strong> ${body.name} (${body.email})</p>
          <p><strong>Company:</strong> ${body.company || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${body.subject}</p>
          <p>${body.description}</p>
          <p><a href="${siteUrl}/dashboard/admin/tickets/${ticket.id}" style="display:inline-block;background:#d76f36;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:700;">Respond in admin</a></p>
        `
      ),
    }),
    sendEmail({
      to: body.email,
      subject: `We received your TokenWatch ticket ${number}`,
      html: emailFrame(
        `Ticket ${number} has been created`,
        `
          <p>We received your request and sent a copy to Flowlog support.</p>
          <p><strong>Subject:</strong> ${body.subject}</p>
          <p>${body.description}</p>
          <p>You can follow ticket progress from your dashboard after signing in.</p>
        `
      ),
    }),
  ])

  return NextResponse.json({ ticketNumber: number })
}
