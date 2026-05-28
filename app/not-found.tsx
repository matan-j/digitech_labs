import Link from 'next/link';

export const metadata = { title: '404 — Digitech Learning Hub' };

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-brand-purple-50 px-4 text-center">
      <div className="max-w-md">
        <p className="text-6xl font-extrabold text-brand-purple-700 mb-3">404</p>
        <h1 className="text-2xl font-extrabold text-neutral-950 mb-2">העמוד לא נמצא</h1>
        <p className="text-neutral-600 mb-6">הקישור שגוי או שהדף נמחק.</p>
        <Link
          href="/learn"
          className="inline-block px-5 py-2.5 rounded-pill bg-brand-purple-700 hover:bg-brand-purple-600 text-white font-semibold transition-colors"
        >
          חזרה ל-Learning Hub
        </Link>
      </div>
    </main>
  );
}
