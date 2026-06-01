import Stripe from 'stripe'
import { cleanEnv } from '@/lib/env'

export function getStripe() {
  const apiKey = cleanEnv(process.env.STRIPE_SECRET_KEY)

  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }

  return new Stripe(apiKey)
}

export const STRIPE_PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER ?? 'price_starter',
  team: process.env.STRIPE_PRICE_TEAM ?? 'price_team',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE ?? 'price_enterprise',
} as const

export const PLAN_NAMES = {
  starter: 'Starter',
  team: 'Team',
  enterprise: 'Enterprise',
} as const
