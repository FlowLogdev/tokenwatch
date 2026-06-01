import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL, emailFrame, sendEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { userId } = await req.json().catch(() => ({ userId: null }))

  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data: profile, error } = await supabase
    .from('users')
    .select('id, email, name, org_id')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'Registration profile not found' }, { status: 404 })
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', profile.org_id)
    .single()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin
  const orgName = organization?.name

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `TokenWatch approval needed: ${orgName ?? profile.email}`,
    html: emailFrame(
      'New customer approval request',
      `
        <p><strong>Name:</strong> ${profile.name}</p>
        <p><strong>Email:</strong> ${profile.email}</p>
        <p><strong>Organization:</strong> ${orgName ?? 'Not provided'}</p>
        <p>
          <a href="${siteUrl}/dashboard/admin" style="display:inline-block;background:#d76f36;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:700;">Review request</a>
        </p>
      `
    ),
  })

  return NextResponse.json({ ok: true })
}
