import { NextRequest, NextResponse } from 'next/server'
import { requireAppUser } from '@/lib/authz'
import { createServiceClient, syncProviderIntegration } from '@/lib/integrations/provider-sync'

export async function POST(req: NextRequest) {
  const { organization } = await requireAppUser()
  const body = await req.json().catch(() => null)
  const integrationId = String(body?.id ?? '')

  if (!integrationId) {
    return NextResponse.json({ error: 'Integration id is required.' }, { status: 400 })
  }

  const sb = createServiceClient()
  const { data: integration, error } = await sb
    .from('provider_integrations')
    .select('id, org_id, provider, display_name, encrypted_secret, config')
    .eq('org_id', organization.id)
    .eq('id', integrationId)
    .single()

  if (error || !integration) {
    return NextResponse.json({ error: error?.message ?? 'Integration not found.' }, { status: 404 })
  }

  try {
    const result = await syncProviderIntegration(sb, integration)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Provider sync failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
