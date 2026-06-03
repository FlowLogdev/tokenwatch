import { createClient } from '@supabase/supabase-js'
import { decryptSecret } from '@/lib/integrations/crypto'
import { cleanEnv } from '@/lib/env'

type SupabaseAdmin = ReturnType<typeof createServiceClient>

type Integration = {
  id: string
  org_id: string
  provider: 'openai' | 'anthropic' | 'github_copilot'
  display_name: string
  encrypted_secret: string
  config: Record<string, unknown> | null
}

type UsageEvent = {
  org_id: string
  engineer_id: string
  tool: string
  model: string
  input_tokens: number
  output_tokens: number
  cost_usd: number
  session_id: string | null
  metadata: Record<string, unknown>
  timestamp: string
}

export function createServiceClient() {
  return createClient(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
  )
}

export async function syncProviderIntegration(sb: SupabaseAdmin, integration: Integration) {
  const secret = decryptSecret(integration.encrypted_secret)
  const now = new Date()
  const since = new Date(now)
  since.setDate(since.getDate() - 1)

  const { data: syncRun } = await sb
    .from('provider_sync_runs')
    .insert({
      org_id: integration.org_id,
      integration_id: integration.id,
      provider: integration.provider,
      status: 'running',
    })
    .select('id')
    .single()

  try {
    const events = integration.provider === 'openai'
      ? await fetchOpenAIUsage(integration, secret, since, now)
      : integration.provider === 'anthropic'
        ? await fetchAnthropicUsage(integration, secret, since, now)
        : await fetchGithubCopilotUsage(integration, secret, since)

    const resolved = []
    for (const event of events) {
      const engineerId = await resolveEngineer(sb, integration.org_id, {
        email: event.engineerEmail,
        name: event.engineerName,
      })
      resolved.push({
        org_id: integration.org_id,
        engineer_id: engineerId,
        tool: event.tool,
        model: event.model,
        input_tokens: event.inputTokens,
        output_tokens: event.outputTokens,
        cost_usd: event.costCents,
        session_id: event.sessionId,
        metadata: event.metadata,
        timestamp: event.timestamp,
      } satisfies UsageEvent)
    }

    if (resolved.length > 0) {
      await sb.from('usage_events').insert(resolved)
      await upsertDailySummaries(sb, resolved)
    }

    await sb
      .from('provider_integrations')
      .update({
        last_synced_at: now.toISOString(),
        last_error: null,
        status: 'active',
        updated_at: now.toISOString(),
      })
      .eq('id', integration.id)

    if (syncRun?.id) {
      await sb
        .from('provider_sync_runs')
        .update({
          status: 'succeeded',
          imported_events: resolved.length,
          finished_at: new Date().toISOString(),
        })
        .eq('id', syncRun.id)
    }

    return { imported: resolved.length }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Provider sync failed'
    await sb
      .from('provider_integrations')
      .update({ last_error: message, status: 'error', updated_at: new Date().toISOString() })
      .eq('id', integration.id)

    if (syncRun?.id) {
      await sb
        .from('provider_sync_runs')
        .update({ status: 'failed', error: message, finished_at: new Date().toISOString() })
        .eq('id', syncRun.id)
    }

    throw error
  }
}

async function fetchOpenAIUsage(integration: Integration, apiKey: string, since: Date, now: Date) {
  const params = new URLSearchParams({
    start_time: Math.floor(since.getTime() / 1000).toString(),
    end_time: Math.floor(now.getTime() / 1000).toString(),
    bucket_width: '1d',
    group_by: 'model',
  })

  const response = await fetch(`https://api.openai.com/v1/organization/usage/completions?${params}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!response.ok) throw new Error(`OpenAI usage sync failed: ${response.status}`)
  const json = await response.json()
  const buckets = Array.isArray(json.data) ? json.data : []

  return buckets.flatMap((bucket: Record<string, unknown>) => {
    const timestamp = new Date(Number(bucket.start_time ?? Math.floor(since.getTime() / 1000)) * 1000).toISOString()
    const results = Array.isArray(bucket.results) ? bucket.results : []
    return results.map((result: Record<string, unknown>, index: number) => ({
      tool: 'chatgpt',
      model: String(result.model ?? 'openai'),
      inputTokens: Number(result.input_tokens ?? 0),
      outputTokens: Number(result.output_tokens ?? 0),
      costCents: 0,
      engineerEmail: String(integration.config?.engineer_email ?? 'provider-sync@tokenwatch.local'),
      engineerName: String(integration.config?.engineer_name ?? integration.display_name),
      sessionId: `${integration.id}:openai:${bucket.start_time ?? 'unknown'}:${index}`,
      timestamp,
      metadata: { provider: 'openai', source: 'organization_usage', raw: result },
    }))
  })
}

async function fetchAnthropicUsage(integration: Integration, apiKey: string, since: Date, now: Date) {
  const params = new URLSearchParams({
    starting_at: since.toISOString(),
    ending_at: now.toISOString(),
    bucket_width: '1d',
  })

  const response = await fetch(`https://api.anthropic.com/v1/organizations/usage_report/messages?${params}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'anthropic-version': '2023-06-01',
    },
  })
  if (!response.ok) throw new Error(`Anthropic usage sync failed: ${response.status}`)
  const json = await response.json()
  const rows = Array.isArray(json.data) ? json.data : []

  return rows.map((row: Record<string, unknown>, index: number) => ({
    tool: 'claude_code',
    model: String(row.model ?? 'claude'),
    inputTokens: Number(row.input_tokens ?? row.input_token_count ?? 0),
    outputTokens: Number(row.output_tokens ?? row.output_token_count ?? 0),
    costCents: Math.round(Number(row.cost_usd ?? row.amount_usd ?? 0) * 100),
    engineerEmail: String(integration.config?.engineer_email ?? 'provider-sync@tokenwatch.local'),
    engineerName: String(integration.config?.engineer_name ?? integration.display_name),
    sessionId: `${integration.id}:anthropic:${row.starting_at ?? index}`,
    timestamp: String(row.starting_at ?? since.toISOString()),
    metadata: { provider: 'anthropic', source: 'usage_report', raw: row },
  }))
}

async function fetchGithubCopilotUsage(integration: Integration, apiKey: string, since: Date) {
  const org = String(integration.config?.github_org ?? '')
  if (!org) throw new Error('GitHub organization is required for Copilot sync')

  const response = await fetch(`https://api.github.com/orgs/${encodeURIComponent(org)}/copilot/usage`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!response.ok) throw new Error(`GitHub Copilot usage sync failed: ${response.status}`)
  const json = await response.json()
  const rows = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []

  return rows.map((row: Record<string, unknown>, index: number) => ({
    tool: 'copilot',
    model: 'github-copilot',
    inputTokens: 0,
    outputTokens: Number(row.total_suggestions_count ?? row.suggestions_count ?? 0),
    costCents: 0,
    engineerEmail: String(integration.config?.engineer_email ?? 'provider-sync@tokenwatch.local'),
    engineerName: String(integration.config?.engineer_name ?? integration.display_name),
    sessionId: `${integration.id}:github:${row.day ?? index}`,
    timestamp: String(row.day ? `${row.day}T12:00:00.000Z` : since.toISOString()),
    metadata: { provider: 'github_copilot', source: 'copilot_usage', raw: row },
  }))
}

async function resolveEngineer(sb: SupabaseAdmin, orgId: string, engineer: { email: string; name: string }) {
  const email = engineer.email.toLowerCase()
  const { data, error } = await sb
    .from('engineers')
    .upsert({ org_id: orgId, email, name: engineer.name, team: 'Provider Sync' }, { onConflict: 'org_id,email' })
    .select('id')
    .single()

  if (error || !data?.id) throw new Error(error?.message ?? 'Could not resolve provider engineer')
  return data.id
}

async function upsertDailySummaries(sb: SupabaseAdmin, events: UsageEvent[]) {
  for (const event of events) {
    const date = event.timestamp.slice(0, 10)
    const { data: existing } = await sb
      .from('daily_summaries')
      .select('id, total_tokens, total_cost_usd, session_count')
      .eq('org_id', event.org_id)
      .eq('engineer_id', event.engineer_id)
      .eq('tool', event.tool)
      .eq('date', date)
      .maybeSingle()

    const tokens = event.input_tokens + event.output_tokens
    if (existing) {
      await sb.from('daily_summaries').update({
        total_tokens: existing.total_tokens + tokens,
        total_cost_usd: existing.total_cost_usd + event.cost_usd,
        session_count: existing.session_count + 1,
      }).eq('id', existing.id)
    } else {
      await sb.from('daily_summaries').insert({
        org_id: event.org_id,
        engineer_id: event.engineer_id,
        tool: event.tool,
        date,
        total_tokens: tokens,
        total_cost_usd: event.cost_usd,
        session_count: 1,
      })
    }
  }
}
