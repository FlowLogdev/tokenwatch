import { NextRequest, NextResponse } from 'next/server'
import { cleanEnv } from '@/lib/env'
import { createServiceClient, syncProviderIntegration } from '@/lib/integrations/provider-sync'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${cleanEnv(process.env.CRON_SECRET)}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = createServiceClient()
  const { data: integrations } = await sb
    .from('provider_integrations')
    .select('id, org_id, provider, display_name, encrypted_secret, config')
    .eq('status', 'active')

  let imported = 0
  let failed = 0

  for (const integration of integrations ?? []) {
    try {
      const result = await syncProviderIntegration(sb, integration)
      imported += result.imported
    } catch {
      failed++
    }
  }

  return NextResponse.json({ ok: true, checked: integrations?.length ?? 0, imported, failed })
}
