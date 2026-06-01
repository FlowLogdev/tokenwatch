import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAppUser, isSupportAdmin } from '@/lib/authz'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { profile } = await requireAppUser()
  const supabase = await createServiceClient()

  if (isSupportAdmin(profile)) {
    const { data: tickets } = await supabase
      .from('support_tickets')
      .select('updated_at,last_admin_read_at')
      .neq('status', 'closed')

    const count = (tickets ?? []).filter(ticket => {
      if (!ticket.last_admin_read_at) return true
      return new Date(ticket.updated_at) > new Date(ticket.last_admin_read_at)
    }).length

    return NextResponse.json({ count })
  }

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('updated_at,last_customer_read_at')
    .or(`org_id.eq.${profile.org_id},requester_email.eq.${profile.email}`)
    .neq('status', 'closed')

  const count = (tickets ?? []).filter(ticket => {
    if (!ticket.last_customer_read_at) return true
    return new Date(ticket.updated_at) > new Date(ticket.last_customer_read_at)
  }).length

  return NextResponse.json({ count })
}
