import { redirect } from 'next/navigation';
import { getCurrentUser, hasPremiumAccess } from '@/lib/auth';

type Props = {
  /** Path used as `return=` so the user comes back here after login/checkout. */
  returnTo: string;
  /** If true, only block guests (no login). Default: also block non-subscribers. */
  premiumOnly?: boolean;
  children: React.ReactNode;
};

/**
 * Server-side gate: wraps premium content. Renders children only if the user
 * meets the access requirement; otherwise redirects to /login or /upgrade.
 *
 * Must be used in a Server Component. For client-side hides, render a separate
 * UI fallback below the gate.
 */
export default async function PaywallGate({ returnTo, premiumOnly = true, children }: Props) {
  const auth = await getCurrentUser();

  if (!auth) {
    redirect(`/login?return=${encodeURIComponent(returnTo)}`);
  }

  if (premiumOnly && !hasPremiumAccess(auth.profile)) {
    redirect(`/upgrade?return=${encodeURIComponent(returnTo)}`);
  }

  return <>{children}</>;
}
