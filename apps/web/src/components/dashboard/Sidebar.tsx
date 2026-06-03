'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: 'OV' },
  { href: '/dashboard/engineers', label: 'Engineers', icon: 'EN' },
  { href: '/dashboard/alerts', label: 'Alerts', icon: 'AL' },
  { href: '/dashboard/budget', label: 'Budget', icon: 'BU' },
  { href: '/dashboard/tools', label: 'Tools', icon: 'TO' },
  { href: '/dashboard/integrations', label: 'Integrations', icon: 'IN' },
  { href: '/dashboard/tickets', label: 'Tickets', icon: 'TI' },
  { href: '/dashboard/admin', label: 'Admin', icon: 'AD' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'SE' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '220px',
      minWidth: '220px',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
    }}>
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="brand-mark" style={{ fontSize: 18 }}>
          Token<span>Watch</span>
        </Link>
      </div>

      <nav style={{ padding: '12px 0', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--text)' : 'var(--muted)',
                textDecoration: 'none',
                background: isActive ? 'var(--surface2)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', width: '22px', textAlign: 'center', letterSpacing: '0.03em' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <Link href="/billing" style={{
          display: 'block',
          background: 'var(--accent-muted)',
          border: '1px solid rgba(215,111,54,0.3)',
          borderRadius: '8px',
          padding: '10px 12px',
          textDecoration: 'none',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Billing
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Manage plan</div>
        </Link>
      </div>
    </aside>
  )
}
