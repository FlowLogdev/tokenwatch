import { NextRequest, NextResponse } from 'next/server'
import { emailFrame, sendEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { to } = await req.json().catch(() => ({ to: 'support@flowlog.dev' }))
  const recipient = typeof to === 'string' && to.includes('@') ? to : 'support@flowlog.dev'

  try {
    const result = await sendEmail({
      to: recipient,
      subject: 'TokenWatch email delivery test',
      html: emailFrame(
        'TokenWatch email delivery test',
        '<p>This is a direct Resend delivery test from the TokenWatch production app.</p>'
      ),
    })

    return NextResponse.json({ ok: true, id: result.data?.id ?? null })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Email test failed' },
      { status: 500 }
    )
  }
}
