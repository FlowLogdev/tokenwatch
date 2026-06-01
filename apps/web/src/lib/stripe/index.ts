import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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
