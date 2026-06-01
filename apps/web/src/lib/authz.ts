import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Organization, User } from '@/types'

export const SUPPORT_EMAIL = 'support@flowlog.dev'

export function isSupportAdmin(profile: Pick<User, 'email' | 'role'> | null | undefined) {
  return profile?.role === 'global_admin' || profile?.email?.toLowerCase() === SUPPORT_EMAIL
}

export async function getSessionProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, authUser: null, profile: null, organization: null }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single<User>()

  const { data: organization } = profile
    ? await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .single<Organization>()
    : { data: null }

  return { supabase, authUser: user, profile, organization }
}

export async function requireAppUser() {
  const session = await getSessionProfile()

  if (!session.authUser || !session.profile || !session.organization) {
    redirect('/auth/login')
  }

  return {
    ...session,
    authUser: session.authUser,
    profile: session.profile,
    organization: session.organization,
  }
}
