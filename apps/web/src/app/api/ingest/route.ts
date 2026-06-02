import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { calcCost, PLAN_LIMITS } from '@/types'
import { cleanEnv } from '@/lib/env'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function getSupabase() {
  return createClient(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
  )
}

async function resolveEngineer(sb: ReturnType<typeof getSupabase>, orgId: string, event: {
  engineer_id?: string
  engineer_email?: string
  engineer_name?: string
  metadata?: Record<string, unknown>
}) {
  if (event.engineer_id && UUID_RE.test(event.engineer_id)) {
    const { data } = await sb
      .from('engineers')
      .select('id')
      .eq('org_id', orgId)
      .eq('id', event.engineer_id)
      .maybeSingle()

    if (data?.id) return data.id
  }

  const emailFromMetadata = typeof event.metadata?.engineer_email === 'string'
    ? event.metadata.engineer_email
    : undefined
  const nameFromMetadata = typeof event.metadata?.engineer_name === 'string'
    ? event.metadata.engineer_name
    : undefined
  const email = (event.engineer_email ?? emailFromMetadata ?? 'unknown@tokenwatch.local').toLowerCase()
  const name = event.engineer_name ?? nameFromMetadata ?? email.split('@')[0] ?? 'Unknown engineer'

  const { data, error } = await sb
    .from('engineers')
    .upsert({
      org_id: orgId,
      email,
      name,
      team: 'Tracked',
    }, { onConflict: 'org_id,email' })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not resolve engineer')
  }

  return data.id
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
    engineer_id?: string
    engineer_email?: string
    engineer_name?: string
    tool: string
    model?: string
    input_tokens?: number
    output_tokens?: number
    cost_usd?: number
    session_id?: string
    metadata?: Record<string, unknown>
    timestamp?: string
  }) => e)

  const resolvedEvents = []
  for (const event of events) {
    const engineerId = await resolveEngineer(sb, apiKey.org_id, event)
    resolvedEvents.push({
      org_id: apiKey.org_id,
      engineer_id: engineerId,
      tool: event.tool,
      model: event.model ?? 'unknown',
      input_tokens: event.input_tokens ?? 0,
      output_tokens: event.output_tokens ?? 0,
      cost_usd: event.cost_usd ?? calcCost(event.tool, event.input_tokens ?? 0, event.output_tokens ?? 0),
      session_id: event.session_id ?? null,
      metadata: {
        ...(event.metadata ?? {}),
        engineer_email: event.engineer_email,
        engineer_name: event.engineer_name,
      },
      timestamp: event.timestamp ?? new Date().toISOString(),
    })
  }

  const { error } = await sb.from('usage_events').insert(resolvedEvents)
  if (error) {
    console.error('Ingest error:', error)
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
  }

  for (const event of resolvedEvents) {
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

  return NextResponse.json({ ok: true, inserted: resolvedEvents.length })
}
