import Link from 'next/link'
import { requireAppUser } from '@/lib/authz'
import ApiKeyActions from '@/components/dashboard/ApiKeyActions'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { supabase, organization } = await requireAppUser()
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('id, name, last_used_at, created_at')
    .eq('org_id', organization.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Settings</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
          Manage your organization and API keys
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px' }}>Organization</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: 4 }}>Organization name</div>
              <div style={{ fontWeight: 700 }}>{organization.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: 4 }}>Plan</div>
              <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{organization.plan}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: 4 }}>Subscription</div>
              <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{organization.subscription_status}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>API Keys</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px', lineHeight: 1.6 }}>
            API keys are shown only when generated. Existing keys are stored as hashes and cannot be revealed. Revoke a key to immediately stop agents or API clients using it.
          </p>
          <div style={{ display: 'grid', gap: '10px' }}>
            {(apiKeys ?? []).length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: '13px' }}>No API keys have been created for this organization.</div>
            )}
            {(apiKeys ?? []).map(key => (
              <div key={key.id} style={{
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--surface2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{key.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: 4 }}>
                    Created {new Date(key.created_at).toLocaleString()}
                    {key.last_used_at ? ` · Last used ${new Date(key.last_used_at).toLocaleString()}` : ' · Never used'}
                  </div>
                </div>
                <ApiKeyActions id={key.id} name={key.name} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>Billing</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px' }}>
            Manage plan selection and Stripe checkout from Billing.
          </p>
          <Link href="/billing" className="btn-ghost" style={{ fontSize: '13px', padding: '8px 16px', textDecoration: 'none' }}>
            Manage Subscription
          </Link>
        </div>
      </div>
    </div>
  )
}
