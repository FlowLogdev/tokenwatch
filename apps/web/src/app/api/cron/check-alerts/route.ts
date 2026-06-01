import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBudgetAlert, sendAnomalyAlert } from '@/lib/resend'
import { cleanEnv } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
  )
  if (req.headers.get('authorization') !== `Bearer ${cleanEnv(process.env.CRON_SECRET)}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const today = now.toISOString().slice(0, 10)

  // Get all orgs
  const { data: orgs } = await supabase.from('organizations').select('id, name, monthly_budget, slack_webhook_url')
  if (!orgs) return NextResponse.json({ ok: true, checked: 0 })

  let alertsCreated = 0

  for (const org of orgs) {
    // Get all engineers for org
    const { data: engineers } = await supabase
      .from('engineers')
      .select('id, email, name, monthly_budget_override')
      .eq('org_id', org.id)

    if (!engineers) continue

    for (const eng of engineers) {
      const budget = eng.monthly_budget_override ?? org.monthly_budget
      if (!budget || budget === 0) continue

      // MTD spend
      const { data: mtdData } = await supabase
        .from('daily_summaries')
        .select('total_cost_usd')
        .eq('org_id', org.id)
        .eq('engineer_id', eng.id)
        .gte('date', monthStart)

      const mtdSpend = mtdData?.reduce((sum, r) => sum + r.total_cost_usd, 0) ?? 0
      const pct = Math.round((mtdSpend / budget) * 100)

      // Check budget thresholds
      for (const threshold of [50, 80, 100] as const) {
        if (pct >= threshold) {
          // Has this already been alerted?
          const { count } = await supabase
            .from('budget_alerts')
            .select('id', { count: 'exact', head: true })
            .eq('org_id', org.id)
            .eq('engineer_id', eng.id)
            .eq('threshold_pct', threshold)
            .gte('triggered_at', monthStart)

          if ((count ?? 0) === 0) {
            await supabase.from('budget_alerts').insert({
              org_id: org.id,
              engineer_id: eng.id,
              threshold_pct: threshold,
              triggered_at: now.toISOString(),
              spend_at_trigger: mtdSpend,
            })

            if (eng.email) {
              await sendBudgetAlert({
                to: eng.email,
                engineerName: eng.name,
                orgName: org.name,
                thresholdPct: threshold,
                spendCents: mtdSpend,
                budgetCents: budget,
                dashboardUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://tokenwatch.flowlog.dev',
              })
            }

            if (org.slack_webhook_url) {
              const emoji = threshold >= 100 ? ':rotating_light:' : threshold >= 80 ? ':warning:' : ':information_source:'
              await fetch(org.slack_webhook_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: `${emoji} *${eng.name}* has used *${threshold}%* of their AI budget this month.\nMTD Spend: $${(mtdSpend / 100).toFixed(2)} / $${(budget / 100).toFixed(2)}`,
                }),
              })
            }

            alertsCreated++
          }
        }
      }

      // Anomaly detection — today vs 7-day rolling average
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: recentDays } = await supabase
        .from('daily_summaries')
        .select('date, total_cost_usd')
        .eq('org_id', org.id)
        .eq('engineer_id', eng.id)
        .gte('date', sevenDaysAgo.toISOString().slice(0, 10))
        .lt('date', today)

      const { data: todayData } = await supabase
        .from('daily_summaries')
        .select('total_cost_usd')
        .eq('org_id', org.id)
        .eq('engineer_id', eng.id)
        .eq('date', today)

      if (!recentDays?.length || !todayData?.length) continue

      const avgSpend = recentDays.reduce((sum, r) => sum + r.total_cost_usd, 0) / recentDays.length
      const todaySpend = todayData.reduce((sum, r) => sum + r.total_cost_usd, 0)

      if (avgSpend > 0 && todaySpend > avgSpend * 3) {
        // Check if anomaly already alerted today
        const { count } = await supabase
          .from('budget_alerts')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', org.id)
          .eq('engineer_id', eng.id)
          .eq('threshold_pct', -1) // anomaly marker
          .gte('triggered_at', today)

        if ((count ?? 0) === 0) {
          await supabase.from('budget_alerts').insert({
            org_id: org.id,
            engineer_id: eng.id,
            threshold_pct: -1,
            triggered_at: now.toISOString(),
            spend_at_trigger: todaySpend,
          })

          if (eng.email) {
            await sendAnomalyAlert({
              to: eng.email,
              engineerName: eng.name,
              todaySpendCents: todaySpend,
              avgSpendCents: avgSpend,
              dashboardUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://tokenwatch.flowlog.dev',
            })
          }

          alertsCreated++
        }
      }
    }
  }

  return NextResponse.json({ ok: true, alertsCreated })
}
