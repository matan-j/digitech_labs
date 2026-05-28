import Link from 'next/link';

export const metadata = {
  title: 'בדוק את המייל שלך — Digitech Learning Hub',
};

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-brand-purple-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-pill bg-brand-purple-100 flex items-center justify-center text-3xl">
          ✉️
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-950 mb-2">
          בדוק את תיבת המייל שלך
        </h1>
        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
          שלחנו לך קישור התחברות. לחץ עליו כדי להיכנס ל-Learning Hub.
          הקישור תקף ל-60 דקות.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm text-brand-purple-700 hover:text-brand-purple-800 font-medium"
        >
          ← נסה כתובת אחרת
        </Link>
      </div>
    </main>
  );
}
