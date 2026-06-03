import { NextRequest, NextResponse } from 'next/server'
import { requireAppUser, isSupportAdmin } from '@/lib/authz'

export async function DELETE(req: NextRequest) {
  const { supabase, organization, profile } = await requireAppUser()
  const id = new URL(req.url).searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'API key id is required.' }, { status: 400 })
  }

  if (profile.role !== 'admin' && !isSupportAdmin(profile)) {
    return NextResponse.json({ error: 'Only admins can revoke API keys.' }, { status: 403 })
  }

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('org_id', organization.id)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
