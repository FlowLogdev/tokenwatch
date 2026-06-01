'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: '▦' },
  { href: '/dashboard/engineers', label: 'Engineers', icon: '👤' },
  { href: '/dashboard/alerts', label: 'Alerts', icon: '🔔' },
  { href: '/dashboard/budget', label: 'Budget', icon: '💰' },
  { href: '/dashboard/tools', label: 'Tools', icon: '🛠' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
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
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--accent)' }}>
            Token<span style={{ color: 'var(--text)' }}>Watch</span>
          </span>
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
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--text)' : 'var(--muted)',
                textDecoration: 'none',
                background: isActive ? 'var(--surface2)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <Link href="/billing" style={{
          display: 'block',
          background: 'var(--accent-muted)',
          border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: '8px',
          padding: '10px 12px',
          textDecoration: 'none',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Starter Plan
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Upgrade →</div>
        </Link>
      </div>
    </aside>
  )
}
