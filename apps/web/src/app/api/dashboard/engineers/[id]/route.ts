import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const to = searchParams.get('to') ?? new Date().toISOString().slice(0, 10)

  const [{ data: engineer }, { data: summaries }, { data: events }] = await Promise.all([
    supabase.from('engineers').select('*').eq('id', params.id).single(),
    supabase.from('daily_summaries').select('*').eq('engineer_id', params.id).gte('date', from).lte('date', to),
    supabase.from('usage_events').select('*').eq('engineer_id', params.id).gte('timestamp', from).lte('timestamp', to).order('timestamp', { ascending: false }).limit(50),
  ])

  return NextResponse.json({ engineer, summaries, events })
}
