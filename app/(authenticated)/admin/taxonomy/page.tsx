import { listDomains, countDomainUsage } from '@/lib/learn/db';
import DomainsManager from './DomainsManager';

export const metadata = { title: 'תחומים — Digitech Learning Hub' };
export const dynamic = 'force-dynamic';

export default async function TaxonomyPage() {
  const domains = await listDomains();
  // Per-domain usage counts (drives the "in use" column + delete guard).
  const counts = await Promise.all(domains.map((d) => countDomainUsage(d.id)));
  const usage: Record<string, number> = {};
  domains.forEach((d, i) => { usage[d.id] = counts[i] ?? 0; });

  return (
    <div className="px-8 py-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-950">תחומים</h1>
        <p className="text-sm text-neutral-500 mt-1">
          התחומים משמשים לסיווג קורסים, הדרכות ופלייבוקים. ניתן להוסיף תחומים חדשים,
          לערוך שם/צבע, ולמחוק תחום שאינו בשימוש.
        </p>
      </header>

      <DomainsManager initial={domains} usage={usage} />
    </div>
  );
}
