import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { calcCost, PLAN_LIMITS } from '@/types'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function verifyApiKey(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer TW_')) return null
  const key = authHeader.slice(7)
  const keyHash = createHash('sha256').update(key).digest('hex')
  const sb = getSupabase()
  const { data } = await sb
    .from('api_keys')
    .select('id, org_id')
    .eq('key_hash', keyHash)
    .single()
  if (data) {
    await sb.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id)
  }
  return data
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const apiKey = await verifyApiKey(authHeader)
  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.events || !Array.isArray(body.events)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const sb = getSupabase()

  const { data: org } = await sb
    .from('organizations')
    .select('plan')
    .eq('id', apiKey.org_id)
    .single()

  const { count: engineerCount } = await sb
    .from('engineers')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', apiKey.org_id)

  const limit = PLAN_LIMITS[(org?.plan ?? 'starter') as keyof typeof PLAN_LIMITS]
  if ((engineerCount ?? 0) >= limit) {
    return NextResponse.json(
      { error: 'Engineer limit reached for current plan. Please upgrade.' },
      { status: 402 }
    )
  }

  const events = body.events.map((e: {
    engineer_id: string
    tool: string
    model?: string
    input_tokens?: number
    output_tokens?: number
    cost_usd?: number
    session_id?: string
    metadata?: Record<string, unknown>
    timestamp?: string
  }) => ({
    org_id: apiKey.org_id,
    engineer_id: e.engineer_id,
    tool: e.tool,
    model: e.model ?? 'unknown',
    input_tokens: e.input_tokens ?? 0,
    output_tokens: e.output_tokens ?? 0,
    cost_usd: e.cost_usd ?? calcCost(e.tool, e.input_tokens ?? 0, e.output_tokens ?? 0),
    session_id: e.session_id ?? null,
    metadata: e.metadata ?? null,
    timestamp: e.timestamp ?? new Date().toISOString(),
  }))

  const { error } = await sb.from('usage_events').insert(events)
  if (error) {
    console.error('Ingest error:', error)
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
  }

  for (const event of events) {
    const date = event.timestamp.slice(0, 10)
    const { data: existing } = await sb
      .from('daily_summaries')
      .select('id, total_tokens, total_cost_usd, session_count')
      .eq('org_id', event.org_id)
      .eq('engineer_id', event.engineer_id)
      .eq('tool', event.tool)
      .eq('date', date)
      .single()

    if (existing) {
      await sb.from('daily_summaries').update({
        total_tokens: existing.total_tokens + event.input_tokens + event.output_tokens,
        total_cost_usd: existing.total_cost_usd + event.cost_usd,
        session_count: existing.session_count + 1,
      }).eq('id', existing.id)
    } else {
      await sb.from('daily_summaries').insert({
        org_id: event.org_id,
        engineer_id: event.engineer_id,
        tool: event.tool,
        date,
        total_tokens: event.input_tokens + event.output_tokens,
        total_cost_usd: event.cost_usd,
        session_count: 1,
      })
    }
  }

  return NextResponse.json({ ok: true, inserted: events.length })
}
