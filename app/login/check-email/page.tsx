import Link from 'next/link';

export const metadata = {
  title: 'בדוק את המייל שלך · DigiTech HUB',
};

export default function CheckEmailPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg-main)' }}
    >
      <div
        className="w-full max-w-md bg-white rounded-panel border border-neutral-200 p-8 sm:p-10 text-center"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div
          className="w-16 h-16 mx-auto mb-5 rounded-pill flex items-center justify-center text-3xl"
          style={{ backgroundColor: 'var(--color-brand-purple-50)' }}
        >
          ✉️
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-950 mb-2">
          בדוק את תיבת המייל שלך
        </h1>
        <p className="text-sm text-neutral-700 mb-6 leading-relaxed">
          שלחנו לך קישור התחברות. לחץ עליו כדי להיכנס ל-DigiTech HUB.
          הקישור תקף ל-60 דקות.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm text-brand-purple-700 hover:text-brand-purple-500 font-semibold"
        >
          ← נסה כתובת אחרת
        </Link>
      </div>
    </main>
  );
}
