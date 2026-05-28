import Link from 'next/link';
import { listLearnCourses } from '@/lib/learn/storage';

export const dynamic = 'force-dynamic';

export default async function LearnAdminIndex() {
  const courses = await listLearnCourses();
  return (
    <div>
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ניהול קורסים ושיעורים</h1>
          <p className="text-gray-500 mt-1">
            {courses.length} {courses.length === 1 ? 'קורס' : 'קורסים'} במערכת הלמידה
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/learn"
            target="_blank"
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            ↗ צפה ב-/learn
          </Link>
          <Link
            href="/learn-admin/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <span className="text-lg leading-none">+</span>
            קורס חדש
          </Link>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500">אין קורסים עדיין.</p>
          <Link
            href="/learn-admin/new"
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            צור קורס ראשון
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {courses.map((c) => {
            const lessonCount = c.lessons.length;
            return (
              <li key={c.slug}>
                <Link
                  href={`/learn-admin/${c.slug}`}
                  className="
                    flex items-center justify-between gap-4 p-4
                    bg-white rounded-lg border border-gray-200
                    hover:border-blue-400 hover:shadow-sm
                    transition-all
                  "
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 truncate">
                        {c.title}
                      </span>
                      <code className="text-xs text-gray-400 font-mono">{c.slug}</code>
                    </div>
                    {c.tagline && (
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {c.tagline}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                    <span>{lessonCount} שיעורים</span>
                    {c.lastUpdated && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span>{c.lastUpdated}</span>
                      </>
                    )}
                    <span className="text-blue-600 font-medium ms-2">ערוך ←</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
