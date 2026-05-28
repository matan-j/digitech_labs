import { getBrandLogoUrl } from '@/lib/brand';
import BrandLogoUploader from './BrandLogoUploader';

export const dynamic = 'force-dynamic';

export default async function BrandSettingsPage() {
  const currentLogoUrl = await getBrandLogoUrl();

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">הגדרות מותג</h1>
        <p className="text-sm text-neutral-500 mt-1.5">
          הלוגו שתעלה כאן יופיע בתפריט הצד של אזור הלמידה, בתפריט ניהול התוכן ובבר הנייד.
        </p>
      </header>

      <section
        className="bg-white rounded-card border border-brand-purple-200 p-6 sm:p-8"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-lg font-extrabold text-neutral-950">לוגו</h2>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          PNG / SVG / JPG / WebP · עד 2MB · רצוי ריבוע (יוצג ב-36×36 פיקסל).
        </p>

        <BrandLogoUploader initialUrl={currentLogoUrl} />
      </section>

      <section
        className="mt-8 bg-white rounded-card border border-brand-purple-200 p-6 sm:p-8"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-lg font-extrabold text-neutral-950">תצוגה מקדימה</h2>
        <p className="text-sm text-neutral-500 mt-1 mb-5">איך הלוגו יראה בתפריט הצד.</p>

        <div className="inline-flex items-center gap-2.5 bg-brand-purple-50 rounded-card px-4 py-3 border border-brand-purple-200">
          {currentLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentLogoUrl} alt="Digitech" className="w-9 h-9 rounded-pill object-cover bg-white" />
          ) : (
            <div className="w-9 h-9 rounded-pill bg-brand-purple-700 flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-extrabold text-neutral-950 leading-tight">Digitech</span>
            <span className="text-[11px] text-neutral-500 leading-tight">Learning Hub</span>
          </div>
        </div>
      </section>
    </div>
  );
}
