'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardTopbar() {
  const router = useRouter()
  const [dateRange, setDateRange] = useState('30d')

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header style={{
      height: '56px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-pulse" style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--green)', display: 'inline-block'
          }} />
          <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>Live</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Date range selector */}
        <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {['7d', '30d', '90d', 'MTD'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                background: dateRange === range ? 'var(--accent)' : 'transparent',
                color: dateRange === range ? 'white' : 'var(--muted)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.15s',
              }}
            >
              {range}
            </button>
          ))}
        </div>

        <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '13px' }}>
          ↓ Export
        </button>

        <button
          onClick={handleSignOut}
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: 'var(--muted)',
          }}
          title="Sign out"
        >
          ⏻
        </button>
      </div>
    </header>
  )
}
