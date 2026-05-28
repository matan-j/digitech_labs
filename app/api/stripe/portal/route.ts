import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { stripe, appUrl } from '@/lib/stripe';

export async function POST() {
  const auth = await getCurrentUser();
  if (!auth) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const customerId = auth.profile.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json({ error: 'no_customer' }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: appUrl('/account'),
  });

  return NextResponse.json({ url: session.url });
}
