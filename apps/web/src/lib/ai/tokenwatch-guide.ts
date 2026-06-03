export type GuideContext = {
  organizationName: string
  plan: string
  subscriptionStatus: string
  apiKeyCount: number
  providerIntegrationCount: number
  engineerCount: number
}

export const TOKENWATCH_GUIDE_KNOWLEDGE = `
TokenWatch is a SaaS dashboard for tracking AI developer-tool spend, token usage, budgets, provider integrations, support tickets, and subscriptions.

Core setup:
1. Customer signs up and waits for approval.
2. After approval, customer chooses a Stripe subscription plan.
3. Dashboard access opens when the organization subscription is active.
4. Admin creates or uses an issued TokenWatch API key.
5. Engineers install the local agent:
   npm install -g tokenwatch-agent
6. Engineers initialize the agent:
   tokenwatch init --key <issued-api-key> --email you@company.com --name "Your Name"
7. Engineers run:
   tokenwatch start

API ingestion:
- TokenWatch accepts events through /api/ingest with Authorization: Bearer TW_<key>.
- Events should include tool, model, input_tokens, output_tokens, cost_usd when known, engineer_email, engineer_name, session_id, metadata, and timestamp.
- If cost_usd is omitted, TokenWatch estimates cost from configured token pricing.
- Engineers are resolved by org_id and engineer_email.

Dashboard areas:
- Overview: month-to-date spend, budget use, tool breakdown, engineers, and alerts.
- Engineers: real tracked engineers, token totals, sessions, spend, and assigned subscription cost.
- Tools: usage by tool and fixed tool subscriptions such as Claude, ChatGPT, Codex, Copilot, Cursor.
- Integrations: OpenAI, Anthropic Claude, and GitHub Copilot provider syncs.
- Budget: monthly budget, forecast, and team allocation.
- Tickets: customer support tickets and admin responses.
- Settings: organization information and API key metadata.

Tool subscriptions:
- Use Tools > Add Tool Subscription for fixed monthly plans.
- Assign subscriptions to an engineer when the cost belongs to one user.
- Subscriptions count toward dashboard spend and budget totals but do not create token counts.

Provider integrations:
- Use Integrations to connect provider admin/API keys.
- OpenAI and Anthropic org usage APIs can import token usage when the account exposes it.
- GitHub Copilot metrics can import Copilot activity where the organization token has access.
- Provider keys are encrypted before storage.

Troubleshooting:
- If no engineers show, send a usage event or add an engineer manually from Engineers.
- If tokens are zero, no usage event with token counts has been ingested yet.
- If subscriptions show spend but no tokens, that is expected for fixed monthly plans.
- If provider sync fails, check the provider API key permissions and the last error on Integrations.
- If the API key cannot be revealed, that is expected; keys are shown only when generated and stored as hashes afterward.
`

export function buildGuidePrompt(question: string, context: GuideContext) {
  return `
You are TokenWatch Guide, the embedded support assistant inside the TokenWatch SaaS dashboard.
Answer customers clearly and practically. Teach them how to use TokenWatch without sending them to support unless the issue needs admin access or billing approval.
Do not invent fake usage, API keys, prices, or provider capabilities.
Use short steps and commands when useful.

Organization context:
- Organization: ${context.organizationName}
- Plan: ${context.plan}
- Subscription status: ${context.subscriptionStatus}
- API keys on record: ${context.apiKeyCount}
- Provider integrations: ${context.providerIntegrationCount}
- Engineers tracked: ${context.engineerCount}

TokenWatch knowledge:
${TOKENWATCH_GUIDE_KNOWLEDGE}

Customer question:
${question}
`
}

export function fallbackGuideAnswer(question: string, context: GuideContext) {
  const q = question.toLowerCase()

  if (q.includes('api') || q.includes('token') || q.includes('key')) {
    return `To connect TokenWatch, use an issued API key from your organization. Existing keys are stored as hashes, so they cannot be revealed again after creation.

Run this on each engineer machine:

\`\`\`bash
npm install -g tokenwatch-agent
tokenwatch init --key <issued-api-key> --email you@company.com --name "Your Name"
tokenwatch start
\`\`\`

Your organization currently has ${context.apiKeyCount} API key record${context.apiKeyCount === 1 ? '' : 's'}. If you do not have the original key value, ask an admin to issue a new one.`
  }

  if (q.includes('install') || q.includes('agent') || q.includes('configure') || q.includes('setup')) {
    return `Set up TokenWatch in this order:

1. Confirm your organization is approved and subscribed.
2. Get an issued TokenWatch API key from your admin.
3. Install the agent:

\`\`\`bash
npm install -g tokenwatch-agent
\`\`\`

4. Initialize it with your engineer identity:

\`\`\`bash
tokenwatch init --key <issued-api-key> --email you@company.com --name "Your Name"
\`\`\`

5. Start tracking:

\`\`\`bash
tokenwatch start
\`\`\`

Usage appears in Overview, Engineers, Tools, and Budget after events are ingested.`
  }

  if (q.includes('subscription') || q.includes('claude') || q.includes('chatgpt') || q.includes('codex')) {
    return `Use Tools > Add Tool Subscription to track fixed monthly costs for Claude, ChatGPT, Codex, Cursor, Copilot, or a custom tool.

Subscriptions count toward spend and budget totals. They do not create token counts by themselves. To track real tokens, connect a provider in Integrations or send usage events through the TokenWatch agent/API.`
  }

  if (q.includes('integration') || q.includes('openai') || q.includes('anthropic') || q.includes('github') || q.includes('copilot')) {
    return `Use Integrations to connect provider usage sources.

Supported provider syncs:
- OpenAI organization usage
- Anthropic Claude usage reports
- GitHub Copilot metrics

Provider keys are encrypted before storage. If a sync fails, open Integrations and check the last error. Most failures are caused by missing provider admin permissions.`
  }

  if (q.includes('ticket') || q.includes('support')) {
    return `Customers can open tickets from the support page or dashboard Tickets area. Admins can respond from the dashboard, and customers can see ticket progress and updates in their own dashboard.`
  }

  return `TokenWatch helps you track AI tool spend, tokens, subscriptions, budgets, provider integrations, engineers, and support tickets.

For setup, start with:

\`\`\`bash
npm install -g tokenwatch-agent
tokenwatch init --key <issued-api-key> --email you@company.com --name "Your Name"
tokenwatch start
\`\`\`

Use Tools for fixed monthly subscriptions, Integrations for provider usage sync, and Engineers to add or review tracked users.`
}
