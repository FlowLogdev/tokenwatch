import { NextRequest, NextResponse } from 'next/server'
import { requireAppUser } from '@/lib/authz'

export async function GET(req: NextRequest) {
  const { supabase, organization } = await requireAppUser()

  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('orgId') ?? organization.id

  const { data: engineers, error } = await supabase
    .from('engineers')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ engineers })
}

export async function POST(req: NextRequest) {
  const { supabase, organization } = await requireAppUser()

  const body = await req.json().catch(() => null)
  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim().toLowerCase()
  const team = body?.team ? String(body.team).trim() : null

  if (!name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('engineers')
    .upsert({
      org_id: organization.id,
      name,
      email,
      team,
    }, { onConflict: 'org_id,email' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ engineer: data })
}
