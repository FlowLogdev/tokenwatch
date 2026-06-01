import { redirect } from 'next/navigation'
import { requireAppUser, isSupportAdmin } from '@/lib/authz'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import DashboardTopbar from '@/components/dashboard/Topbar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, organization } = await requireAppUser()

  if (!isSupportAdmin(profile)) {
    if (organization.approval_status === 'pending') {
      redirect('/pending-approval')
    }

    if (organization.approval_status === 'denied') {
      redirect('/access-denied')
    }

    if (organization.subscription_status !== 'active') {
      redirect('/billing')
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DashboardTopbar />
        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
