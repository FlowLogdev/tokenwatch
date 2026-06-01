import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('orgId')
  const from = searchParams.get('from') ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const to = searchParams.get('to') ?? new Date().toISOString().slice(0, 10)

  const { data: summaries } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('org_id', orgId)
    .gte('date', from)
    .lte('date', to)

  const totalCost = summaries?.reduce((sum, s) => sum + s.total_cost_usd, 0) ?? 0
  const totalTokens = summaries?.reduce((sum, s) => sum + s.total_tokens, 0) ?? 0

  const { count: engineerCount } = await supabase
    .from('engineers')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)

  const { data: org } = await supabase
    .from('organizations')
    .select('monthly_budget')
    .eq('id', orgId)
    .single()

  return NextResponse.json({
    totalCostCents: totalCost,
    totalTokens,
    engineerCount: engineerCount ?? 0,
    budgetCents: org?.monthly_budget ?? 0,
    budgetUsedPct: org?.monthly_budget ? Math.round((totalCost / org.monthly_budget) * 100) : 0,
    summaries,
  })
}
