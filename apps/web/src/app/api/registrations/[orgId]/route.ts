import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAppUser, isSupportAdmin } from '@/lib/authz'
import { emailFrame, sendEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: { orgId: string } }) {
  const { profile } = await requireAppUser()

  if (!isSupportAdmin(profile)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { action } = await req.json().catch(() => ({ action: null }))
  if (action !== 'approve' && action !== 'deny') {
    return NextResponse.json({ error: 'Action must be approve or deny.' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const approvalStatus = action === 'approve' ? 'approved' : 'denied'
  const { data: organization, error } = await supabase
    .from('organizations')
    .update({ approval_status: approvalStatus })
    .eq('id', params.orgId)
    .select('*')
    .single()

  if (error || !organization) {
    return NextResponse.json({ error: error?.message ?? 'Organization not found.' }, { status: 404 })
  }

  const { data: users } = await supabase
    .from('users')
    .select('email, name')
    .eq('org_id', params.orgId)
    .eq('role', 'admin')

  const recipients = (users ?? []).map(user => user.email)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin

  if (recipients.length > 0) {
    await sendEmail({
      to: recipients,
      subject: action === 'approve' ? 'TokenWatch access approved' : 'TokenWatch access request update',
      html: emailFrame(
        action === 'approve' ? 'Your TokenWatch access was approved' : 'Your TokenWatch access request was not approved',
        action === 'approve'
          ? `
              <p>${organization.name} has been approved. Choose your subscription plan and complete payment through Stripe to unlock the dashboard.</p>
              <p><a href="${siteUrl}/billing" style="display:inline-block;background:#d76f36;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:700;">Choose a plan</a></p>
            `
          : '<p>Flowlog support reviewed the request and did not approve dashboard access. Reply by opening a support ticket if you need more context.</p>'
      ),
    })
  }

  return NextResponse.json({ ok: true })
}
