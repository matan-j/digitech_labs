import { ShieldCheck } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBrandLogoUrl } from '@/lib/brand';
import AdminLoginForm from './AdminLoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string }>;
}) {
  const auth = await getCurrentUser();
  const { return: returnTo } = await searchParams;

  // If already an admin, skip the form entirely.
  if (auth?.profile.role === 'admin') {
    redirect(returnTo && returnTo.startsWith('/admin') ? returnTo : '/admin');
  }

  const logoUrl = await getBrandLogoUrl();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ backgroundImage: 'var(--grad-hero)' }}
    >
      <div
        className="w-full max-w-md bg-white rounded-panel p-8 sm:p-10 border border-neutral-200"
        style={{ boxShadow: 'var(--shadow-elevated)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col leading-tight">
            <h1 className="text-xl font-extrabold text-neutral-950">
              DigiTech
              <span className="text-brand-purple-500 text-[11px] tracking-wider align-top mr-1">HUB</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">כניסת אדמין</p>
          </div>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="DigiTech" className="w-11 h-11 rounded-[12px] object-cover" />
          ) : (
            <span
              className="brand-badge"
              style={{ ['--s' as never]: '44px' }}
              aria-hidden
            >
              <span className="swoosh" />
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-2.5 mb-5 px-3 py-2.5 rounded-card"
          style={{
            backgroundColor: 'var(--color-brand-purple-50)',
            border: '1px solid var(--color-brand-purple-200)',
          }}
        >
          <ShieldCheck className="w-4 h-4 text-brand-purple-700 shrink-0" />
          <p className="text-xs text-brand-purple-900">
            אזור זה מיועד לבעלי הרשאות אדמין בלבד. משתמשים רגילים — <a href="/login" className="underline font-semibold">לחץ כאן</a>.
          </p>
        </div>

        <h2 className="text-2xl font-extrabold text-neutral-950 mb-1.5">כניסה</h2>
        <p className="text-sm text-neutral-700 mb-6">
          התחבר עם Google או מייל וסיסמה כדי להגיע ללוח הניהול.
        </p>

        <AdminLoginForm returnTo={returnTo} />
      </div>
    </div>
  );
}
