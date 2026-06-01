import { Resend } from 'resend'
import { cleanEnv } from '@/lib/env'

function getResend() {
  const apiKey = cleanEnv(process.env.RESEND_API_KEY, 'placeholder')
  return new Resend(apiKey)
}

const FROM = 'TokenWatch <support@flowlog.dev>'
export const ADMIN_EMAIL = 'support@flowlog.dev'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}) {
  if (!cleanEnv(process.env.RESEND_API_KEY)) {
    console.warn('RESEND_API_KEY is not configured. Email skipped:', subject)
    return { data: null, error: null }
  }

  const result = await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html,
  })

  if (result.error) {
    console.error('Resend delivery error:', result.error)
    throw new Error(`Resend delivery failed: ${result.error.message}`)
  }

  return result
}

export function emailFrame(title: string, body: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0d0f0e; color: #f4efe6; padding: 32px;">
      <div style="font-size: 22px; font-weight: 800; margin-bottom: 24px;">Token<span style="color:#d76f36;">Watch</span></div>
      <h1 style="font-size: 22px; line-height: 1.3; margin: 0 0 16px;">${title}</h1>
      <div style="color: #c8c0b4; font-size: 14px; line-height: 1.7;">${body}</div>
      <p style="color:#7e786f; font-size: 12px; margin-top: 32px;">Sent by TokenWatch support.</p>
    </div>
  `
}

export async function sendBudgetAlert({
  to,
  engineerName,
  orgName,
  thresholdPct,
  spendCents,
  budgetCents,
  dashboardUrl,
}: {
  to: string
  engineerName: string
  orgName: string
  thresholdPct: number
  spendCents: number
  budgetCents: number
  dashboardUrl: string
}) {
  const spend = (spendCents / 100).toFixed(2)
  const budget = (budgetCents / 100).toFixed(2)
  const remaining = ((budgetCents - spendCents) / 100).toFixed(2)
  const emoji = thresholdPct >= 100 ? '🚨' : thresholdPct >= 80 ? '⚠️' : 'ℹ️'

  return getResend().emails.send({
    from: 'TokenWatch <alerts@tokenwatch.flowlog.dev>',
    to,
    subject: `${emoji} ${engineerName} has used ${thresholdPct}% of their AI budget`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0b; color: #f0f0f2; padding: 32px; border-radius: 12px;">
        <div style="margin-bottom: 24px;">
          <span style="color: #f97316; font-size: 24px; font-weight: 800;">TokenWatch</span>
        </div>
        <h2 style="margin: 0 0 8px; font-size: 20px;">${emoji} Budget Alert for ${engineerName}</h2>
        <p style="color: #6b6b78; margin: 0 0 24px;">This engineer has reached <strong style="color: #f0f0f2;">${thresholdPct}%</strong> of their monthly AI spend budget.</p>

        <div style="background: #111113; border: 1px solid #222228; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #6b6b78;">Engineer</span>
            <span>${engineerName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #6b6b78;">Organization</span>
            <span>${orgName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #6b6b78;">MTD Spend</span>
            <span style="font-family: monospace; color: ${thresholdPct >= 100 ? '#ef4444' : thresholdPct >= 80 ? '#eab308' : '#f0f0f2'};">$${spend}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #6b6b78;">Monthly Budget</span>
            <span style="font-family: monospace;">$${budget}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #6b6b78;">Remaining</span>
            <span style="font-family: monospace; color: #22c55e;">$${remaining}</span>
          </div>
        </div>

        <a href="${dashboardUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Dashboard →</a>

        <p style="color: #6b6b78; font-size: 12px; margin-top: 32px;">Sent by TokenWatch · <a href="${dashboardUrl}/dashboard/alerts" style="color: #6b6b78;">Manage alerts</a></p>
      </div>
    `,
  })
}

export async function sendAnomalyAlert({
  to,
  engineerName,
  todaySpendCents,
  avgSpendCents,
  dashboardUrl,
}: {
  to: string
  engineerName: string
  todaySpendCents: number
  avgSpendCents: number
  dashboardUrl: string
}) {
  const today = (todaySpendCents / 100).toFixed(2)
  const avg = (avgSpendCents / 100).toFixed(2)
  const multiplier = (todaySpendCents / avgSpendCents).toFixed(1)

  return getResend().emails.send({
    from: 'TokenWatch <alerts@tokenwatch.flowlog.dev>',
    to,
    subject: `🔴 Anomaly: ${engineerName} spending ${multiplier}x normal today`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0b; color: #f0f0f2; padding: 32px; border-radius: 12px;">
        <div style="margin-bottom: 24px;">
          <span style="color: #f97316; font-size: 24px; font-weight: 800;">TokenWatch</span>
        </div>
        <h2 style="margin: 0 0 8px; font-size: 20px;">🔴 Spending Anomaly Detected</h2>
        <p style="color: #6b6b78; margin: 0 0 24px;">${engineerName}'s spend today is <strong style="color: #ef4444;">${multiplier}x</strong> their 7-day average.</p>

        <div style="background: #111113; border: 1px solid #222228; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #6b6b78;">Today's Spend</span>
            <span style="font-family: monospace; color: #ef4444;">$${today}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #6b6b78;">7-Day Average</span>
            <span style="font-family: monospace;">$${avg}</span>
          </div>
        </div>

        <a href="${dashboardUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Dashboard →</a>
      </div>
    `,
  })
}
