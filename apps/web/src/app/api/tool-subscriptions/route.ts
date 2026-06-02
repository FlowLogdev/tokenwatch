import { NextRequest, NextResponse } from 'next/server'
import { requireAppUser, isSupportAdmin } from '@/lib/authz'

const allowedTools = new Set(['claude_code', 'chatgpt', 'codex', 'cursor', 'copilot', 'custom'])
const allowedStatuses = new Set(['active', 'paused', 'canceled'])

export async function POST(req: NextRequest) {
  const { supabase, organization } = await requireAppUser()
  const body = await req.json().catch(() => null)

  const tool = String(body?.tool ?? '')
  const planName = String(body?.plan_name ?? '').trim()
  const monthlyCostDollars = Number(body?.monthly_cost_dollars)
  const engineerId = body?.engineer_id ? String(body.engineer_id) : null
  const renewalDay = body?.renewal_day ? Number(body.renewal_day) : null
  const notes = body?.notes ? String(body.notes).trim() : null

  if (!allowedTools.has(tool)) {
    return NextResponse.json({ error: 'Choose a valid AI tool.' }, { status: 400 })
  }

  if (!planName) {
    return NextResponse.json({ error: 'Plan name is required.' }, { status: 400 })
  }

  if (!Number.isFinite(monthlyCostDollars) || monthlyCostDollars < 0) {
    return NextResponse.json({ error: 'Monthly cost must be zero or higher.' }, { status: 400 })
  }

  if (renewalDay !== null && (!Number.isInteger(renewalDay) || renewalDay < 1 || renewalDay > 31)) {
    return NextResponse.json({ error: 'Renewal day must be between 1 and 31.' }, { status: 400 })
  }

  if (engineerId) {
    const { data: engineer } = await supabase
      .from('engineers')
      .select('id')
      .eq('org_id', organization.id)
      .eq('id', engineerId)
      .maybeSingle()

    if (!engineer) {
      return NextResponse.json({ error: 'Engineer was not found for this organization.' }, { status: 404 })
    }
  }

  const { error } = await supabase.from('tool_subscriptions').insert({
    org_id: organization.id,
    engineer_id: engineerId,
    tool,
    plan_name: planName,
    monthly_cost_cents: Math.round(monthlyCostDollars * 100),
    billing_cycle: 'monthly',
    renewal_day: renewalDay,
    status: 'active',
    notes,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const { supabase, organization } = await requireAppUser()
  const body = await req.json().catch(() => null)
  const id = String(body?.id ?? '')
  const status = String(body?.status ?? '')

  if (!id || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: 'Valid subscription and status are required.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('tool_subscriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('org_id', organization.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { supabase, organization, profile } = await requireAppUser()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Subscription id is required.' }, { status: 400 })
  }

  if (profile.role !== 'admin' && !isSupportAdmin(profile)) {
    return NextResponse.json({ error: 'Only admins can delete subscriptions.' }, { status: 403 })
  }

  const { error } = await supabase
    .from('tool_subscriptions')
    .delete()
    .eq('id', id)
    .eq('org_id', organization.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
