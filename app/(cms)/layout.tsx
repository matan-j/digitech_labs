import Link from 'next/link';

export default function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors"
          >
            🏭 Digitech Labs
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/learn-admin"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              📝 ניהול שיעורים
            </Link>
            <Link
              href="/learn"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              ↗ אזור הלמידה
            </Link>
            <Link
              href="/new"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + קורס חדש
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
