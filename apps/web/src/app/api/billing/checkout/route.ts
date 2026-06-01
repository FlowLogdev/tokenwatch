import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAppUser } from '@/lib/authz'
import { getStripe, STRIPE_PRICES } from '@/lib/stripe'
import type { Plan } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { profile, organization } = await requireAppUser()
  const stripe = getStripe()
  const { plan } = await req.json().catch(() => ({ plan: null }))

  if (!plan || !['starter', 'team', 'enterprise'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 })
  }

  if (organization.approval_status !== 'approved') {
    return NextResponse.json({ error: 'This organization is not approved yet.' }, { status: 403 })
  }

  const selectedPlan = plan as Plan
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin
  let customerId = organization.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      name: organization.name,
      metadata: { org_id: organization.id },
    })
    customerId = customer.id

    const supabase = await createServiceClient()
    await supabase
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', organization.id)
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: STRIPE_PRICES[selectedPlan], quantity: 1 }],
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/billing?checkout=canceled`,
    metadata: {
      org_id: organization.id,
      plan: selectedPlan,
    },
    subscription_data: {
      metadata: {
        org_id: organization.id,
        plan: selectedPlan,
      },
    },
  })

  return NextResponse.json({ url: session.url })
}
