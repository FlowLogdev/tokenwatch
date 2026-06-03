import { NextRequest, NextResponse } from 'next/server'
import { requireAppUser } from '@/lib/authz'
import { buildGuidePrompt, fallbackGuideAnswer } from '@/lib/ai/tokenwatch-guide'
import { cleanEnv } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { supabase, organization } = await requireAppUser()
  const body = await req.json().catch(() => null)
  const question = String(body?.message ?? '').trim()

  if (!question) {
    return NextResponse.json({ error: 'Ask a question first.' }, { status: 400 })
  }

  const [{ count: apiKeyCount }, { count: providerIntegrationCount }, { count: engineerCount }] = await Promise.all([
    supabase.from('api_keys').select('id', { count: 'exact', head: true }).eq('org_id', organization.id),
    supabase.from('provider_integrations').select('id', { count: 'exact', head: true }).eq('org_id', organization.id),
    supabase.from('engineers').select('id', { count: 'exact', head: true }).eq('org_id', organization.id),
  ])

  const context = {
    organizationName: organization.name,
    plan: organization.plan,
    subscriptionStatus: organization.subscription_status,
    apiKeyCount: apiKeyCount ?? 0,
    providerIntegrationCount: providerIntegrationCount ?? 0,
    engineerCount: engineerCount ?? 0,
  }

  const openaiKey = cleanEnv(process.env.OPENAI_API_KEY)
  if (!openaiKey) {
    return NextResponse.json({
      answer: fallbackGuideAnswer(question, context),
      mode: 'guided',
    })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: cleanEnv(process.env.AI_GUIDE_MODEL, 'gpt-4.1-mini'),
        input: buildGuidePrompt(question, context),
        max_output_tokens: 900,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({
        answer: fallbackGuideAnswer(question, context),
        mode: 'guided',
        warning: `AI provider returned ${response.status}; used built-in guide instead.`,
      })
    }

    const data = await response.json()
    const answer = typeof data.output_text === 'string'
      ? data.output_text
      : extractResponseText(data)

    return NextResponse.json({
      answer: answer || fallbackGuideAnswer(question, context),
      mode: answer ? 'ai' : 'guided',
    })
  } catch {
    return NextResponse.json({
      answer: fallbackGuideAnswer(question, context),
      mode: 'guided',
      warning: 'AI provider unavailable; used built-in guide instead.',
    })
  }
}

function extractResponseText(data: unknown) {
  if (!data || typeof data !== 'object') return ''
  const output = (data as { output?: unknown }).output
  if (!Array.isArray(output)) return ''
  const parts: string[] = []
  for (const item of output) {
    if (!item || typeof item !== 'object') continue
    const content = (item as { content?: unknown }).content
    if (!Array.isArray(content)) continue
    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== 'object') continue
      const text = (contentItem as { text?: unknown }).text
      if (typeof text === 'string') parts.push(text)
    }
  }
  return parts.join('\n\n').trim()
}
