export type Plan = 'starter' | 'team' | 'enterprise'
export type Role = 'admin' | 'member'
export type Tool = 'claude_code' | 'codex' | 'chatgpt' | 'cursor' | 'copilot' | 'custom'

export interface Organization {
  id: string
  name: string
  slug: string
  plan: Plan
  monthly_budget: number // cents
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

export interface User {
  id: string
  org_id: string
  email: string
  name: string
  role: Role
  avatar_url: string | null
  created_at: string
}

export interface Engineer {
  id: string
  org_id: string
  name: string
  email: string
  team: string | null
  monthly_budget_override: number | null // cents
  created_at: string
}

export interface UsageEvent {
  id: string
  org_id: string
  engineer_id: string
  tool: Tool
  model: string
  input_tokens: number
  output_tokens: number
  cost_usd: number // stored as cents
  session_id: string | null
  metadata: Record<string, unknown> | null
  timestamp: string
}

export interface DailySummary {
  id: string
  org_id: string
  engineer_id: string
  tool: Tool
  date: string
  total_tokens: number
  total_cost_usd: number // cents
  session_count: number
  created_at: string
}

export interface BudgetAlert {
  id: string
  org_id: string
  engineer_id: string
  threshold_pct: 50 | 80 | 100
  triggered_at: string
  notified_at: string | null
  spend_at_trigger: number // cents
}

export interface ApiKey {
  id: string
  org_id: string
  key_hash: string
  name: string
  last_used_at: string | null
  created_at: string
}

// Tool cost config (per million tokens, in cents)
export const TOOL_COSTS: Record<string, { input: number; output: number }> = {
  claude_code: { input: 300, output: 1500 },   // $3/$15 per MTok
  claude_sonnet: { input: 300, output: 1500 },
  codex: { input: 150, output: 200 },           // $1.50/$2 per MTok
  chatgpt: { input: 250, output: 1000 },        // $2.50/$10 per MTok (GPT-4o)
  cursor: { input: 250, output: 1000 },
  copilot: { input: 100, output: 100 },
  custom: { input: 100, output: 100 },
}

export const PLAN_LIMITS: Record<Plan, number> = {
  starter: 10,
  team: 50,
  enterprise: Infinity,
}

export function calcCost(tool: string, inputTokens: number, outputTokens: number): number {
  const costs = TOOL_COSTS[tool] ?? TOOL_COSTS.custom
  return Math.round(
    (inputTokens / 1_000_000) * costs.input +
    (outputTokens / 1_000_000) * costs.output
  )
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function formatCentsShort(cents: number): string {
  const dollars = cents / 100
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`
  return `$${dollars.toFixed(2)}`
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`
  return tokens.toString()
}
