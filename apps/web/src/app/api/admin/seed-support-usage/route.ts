import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const SUPPORT_EMAIL = 'support@flowlog.dev'

const SAMPLE_DAYS = [
  { daysAgo: 8, tool: 'claude_code', tokens: 184000, cost: 1840 },
  { daysAgo: 7, tool: 'cursor', tokens: 96000, cost: 720 },
  { daysAgo: 6, tool: 'chatgpt', tokens: 124000, cost: 980 },
  { daysAgo: 5, tool: 'claude_code', tokens: 211000, cost: 2160 },
  { daysAgo: 4, tool: 'codex', tokens: 132000, cost: 460 },
  { daysAgo: 3, tool: 'cursor', tokens: 87000, cost: 690 },
  { daysAgo: 2, tool: 'claude_code', tokens: 246000, cost: 2380 },
  { daysAgo: 1, tool: 'chatgpt', tokens: 104000, cost: 820 },
  { daysAgo: 0, tool: 'codex', tokens: 148000, cost: 510 },
]

function dateKey(daysAgo: number) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

export async function POST() {
  const supabase = await createServiceClient()
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, org_id, email, name')
    .eq('email', SUPPORT_EMAIL)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'support@flowlog.dev profile not found' }, { status: 404 })
  }

  await supabase
    .from('organizations')
    .update({
      monthly_budget: 200000,
      approval_status: 'approved',
      subscription_status: 'active',
      plan: 'enterprise',
    })
    .eq('id', profile.org_id)

  const { data: engineer, error: engineerError } = await supabase
    .from('engineers')
    .upsert({
      org_id: profile.org_id,
      name: 'Fabio Almeida',
      email: SUPPORT_EMAIL,
      team: 'Flowlog Admin',
      monthly_budget_override: 25000,
    }, { onConflict: 'org_id,email' })
    .select('id')
    .single()

  if (engineerError || !engineer) {
    return NextResponse.json({ error: engineerError?.message ?? 'Could not create engineer' }, { status: 500 })
  }

  const rows = SAMPLE_DAYS.map(item => ({
    org_id: profile.org_id,
    engineer_id: engineer.id,
    tool: item.tool,
    date: dateKey(item.daysAgo),
    total_tokens: item.tokens,
    total_cost_usd: item.cost,
    session_count: Math.max(1, Math.round(item.tokens / 80000)),
  }))

  const { error: summaryError } = await supabase
    .from('daily_summaries')
    .upsert(rows, { onConflict: 'org_id,engineer_id,tool,date' })

  if (summaryError) {
    return NextResponse.json({ error: summaryError.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    engineerId: engineer.id,
    totalCostCents: rows.reduce((sum, row) => sum + row.total_cost_usd, 0),
    rows: rows.length,
  })
}
