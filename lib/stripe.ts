import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // Allow the module to load (env may not be set in some build contexts), but throw at usage.
  console.warn('[stripe] STRIPE_SECRET_KEY is not set — Stripe calls will fail');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
});

export function appUrl(path = ''): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3030';
  return `${base.replace(/\/$/, '')}${path}`;
}
