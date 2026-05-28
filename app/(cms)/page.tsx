import Link from 'next/link';
import { listCourses } from '@/lib/fileSystem';
import CourseList from '@/components/CourseList';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const courses = await listCourses();

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">קורסים</h1>
          <p className="text-gray-500 mt-1">
            {courses.length} קורס{courses.length !== 1 ? 'ים' : ''} במערכת
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/new-playbook"
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold px-5 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            📖 פלייבוק חדש
          </Link>
          <Link
            href="/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            קורס חדש
          </Link>
        </div>
      </div>

      {/* Stats */}
      {courses.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            <p className="text-sm text-gray-500 mt-0.5">סה&quot;כ קורסים</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {courses.filter(c => c.status === 'READY_FOR_PILOT').length}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">מוכנים לפיילוט</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {courses.reduce((sum, c) => sum + c.files.length, 0)}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">קבצים שנוצרו</p>
          </div>
        </div>
      )}

      <CourseList courses={courses} />
    </div>
  );
}
