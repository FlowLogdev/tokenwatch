import AIGuideChat from '@/components/dashboard/AIGuideChat'

export const dynamic = 'force-dynamic'

export default function GuidePage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>AI Guide</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
          Help customers configure TokenWatch without opening a support ticket.
        </p>
      </div>

      <AIGuideChat />
    </div>
  )
}
