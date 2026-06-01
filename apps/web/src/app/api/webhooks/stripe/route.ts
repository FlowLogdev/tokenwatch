import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { cleanEnv } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const supabase = createClient(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
  )
  const PRICE_TO_PLAN: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER ?? 'price_starter']: 'starter',
    [process.env.STRIPE_PRICE_TEAM ?? 'price_team']: 'team',
    [process.env.STRIPE_PRICE_ENTERPRISE ?? 'price_enterprise']: 'enterprise',
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, cleanEnv(process.env.STRIPE_WEBHOOK_SECRET))
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0].price.id
    const plan = PRICE_TO_PLAN[priceId] ?? 'starter'
    await supabase
      .from('organizations')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan,
        subscription_status: 'active',
      })
      .eq('id', session.metadata?.org_id ?? '')
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const priceId = sub.items.data[0].price.id
    const plan = PRICE_TO_PLAN[priceId] ?? 'starter'
    const subscriptionStatus = sub.status === 'active' || sub.status === 'trialing'
      ? 'active'
      : sub.status === 'past_due'
        ? 'past_due'
        : 'unpaid'
    await supabase
      .from('organizations')
      .update({ plan, stripe_subscription_id: sub.id, subscription_status: subscriptionStatus })
      .eq('stripe_customer_id', sub.customer as string)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase
      .from('organizations')
      .update({ plan: 'starter', stripe_subscription_id: null, subscription_status: 'canceled' })
      .eq('stripe_customer_id', sub.customer as string)
  }

  return NextResponse.json({ received: true })
}
