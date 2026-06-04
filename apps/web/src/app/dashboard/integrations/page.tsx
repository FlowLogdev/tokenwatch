import ProviderIntegrationForm from '@/components/dashboard/ProviderIntegrationForm'
import ProviderIntegrationActions from '@/components/dashboard/ProviderIntegrationActions'
import { requireAppUser } from '@/lib/authz'

const LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic Claude',
  github_copilot: 'GitHub Copilot',
}

function formatDate(value: string | null) {
  if (!value) return 'Never'
  return new Date(value).toLocaleString()
}

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  const { supabase, organization } = await requireAppUser()
  const [{ data: integrations }, { data: runs }] = await Promise.all([
    supabase
      .from('provider_integrations')
      .select('id, provider, display_name, status, last_synced_at, last_error, created_at')
      .eq('org_id', organization.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('provider_sync_runs')
      .select('integration_id, status, imported_events, error, started_at, finished_at')
      .eq('org_id', organization.id)
      .order('started_at', { ascending: false })
      .limit(20),
  ])

  const latestRun = new Map<string, {
    status: string
    imported_events: number
    error: string | null
    started_at: string
  }>()
  for (const run of runs ?? []) {
    if (!latestRun.has(run.integration_id)) latestRun.set(run.integration_id, run)
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Integrations</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
          Connect provider usage APIs to import real tokens and costs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '20px', alignItems: 'start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Connected Providers</h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(140px, 1.1fr) minmax(230px, 1.7fr) 120px 120px minmax(180px, auto)',
              gap: '16px',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              color: 'var(--muted)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              alignItems: 'center',
            }}
          >
            <div>Provider</div>
            <div>Status</div>
            <div>Last Sync</div>
            <div>Last Run</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {(integrations ?? []).length === 0 && (
            <div style={{ color: 'var(--muted)', fontSize: '13px', padding: '18px 24px' }}>
              No providers are connected yet.
            </div>
          )}

          {(integrations ?? []).map(integration => {
            const run = latestRun.get(integration.id)
            const statusColor = integration.status === 'error'
              ? 'var(--red)'
              : integration.status === 'active'
                ? 'var(--green)'
                : 'var(--muted)'

            return (
              <div
                key={integration.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(140px, 1.1fr) minmax(230px, 1.7fr) 120px 120px minmax(180px, auto)',
                  gap: '16px',
                  padding: '18px 16px',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{LABELS[integration.provider] ?? integration.provider}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: 4 }}>{integration.display_name}</div>
                </div>
                <div>
                  <span
                    style={{
                      color: statusColor,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      fontSize: '12px',
                    }}
                  >
                    {integration.status}
                  </span>
                  {integration.last_error && (
                    <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: 6, lineHeight: 1.45 }}>
                      {integration.last_error}
                    </div>
                  )}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.4 }}>
                  {formatDate(integration.last_synced_at)}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.4 }}>
                  {run ? `${run.status} - ${run.imported_events} events` : 'No syncs yet'}
                </div>
                <ProviderIntegrationActions id={integration.id} status={integration.status} />
              </div>
            )
          })}
        </div>

        <ProviderIntegrationForm />
      </div>
    </div>
  )
}
