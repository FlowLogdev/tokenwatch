import { NextRequest, NextResponse } from 'next/server'
import { requireAppUser, isSupportAdmin } from '@/lib/authz'
import { encryptSecret } from '@/lib/integrations/crypto'

const providers = new Set(['openai', 'anthropic', 'github_copilot'])

export async function POST(req: NextRequest) {
  const { supabase, organization, profile } = await requireAppUser()
  const body = await req.json().catch(() => null)

  if (profile.role !== 'admin' && !isSupportAdmin(profile)) {
    return NextResponse.json({ error: 'Only admins can connect providers.' }, { status: 403 })
  }

  const provider = String(body?.provider ?? '')
  const displayName = String(body?.display_name ?? '').trim()
  const apiKey = String(body?.api_key ?? '').trim()
  const engineerEmail = String(body?.engineer_email ?? '').trim().toLowerCase()
  const engineerName = String(body?.engineer_name ?? '').trim()
  const githubOrg = String(body?.github_org ?? '').trim()

  if (!providers.has(provider)) {
    return NextResponse.json({ error: 'Choose a valid provider.' }, { status: 400 })
  }

  if (!displayName || !apiKey) {
    return NextResponse.json({ error: 'Display name and API key are required.' }, { status: 400 })
  }

  if (provider === 'github_copilot' && !githubOrg) {
    return NextResponse.json({ error: 'GitHub organization is required for Copilot sync.' }, { status: 400 })
  }

  let encryptedSecret = ''
  try {
    encryptedSecret = encryptSecret(apiKey)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not encrypt provider key.'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const config = {
    engineer_email: engineerEmail || null,
    engineer_name: engineerName || null,
    github_org: githubOrg || null,
  }

  const { error } = await supabase.from('provider_integrations').upsert({
    org_id: organization.id,
    provider,
    display_name: displayName,
    encrypted_secret: encryptedSecret,
    config,
    status: 'active',
    last_error: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'org_id,provider,display_name' })

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

  if (!id || !['active', 'paused'].includes(status)) {
    return NextResponse.json({ error: 'Valid integration and status are required.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('provider_integrations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('org_id', organization.id)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { supabase, organization, profile } = await requireAppUser()
  const id = new URL(req.url).searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Integration id is required.' }, { status: 400 })
  }

  if (profile.role !== 'admin' && !isSupportAdmin(profile)) {
    return NextResponse.json({ error: 'Only admins can delete providers.' }, { status: 403 })
  }

  const { error } = await supabase
    .from('provider_integrations')
    .delete()
    .eq('org_id', organization.id)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
