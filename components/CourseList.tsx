'use client';

import Link from 'next/link';
import { CourseFolder } from '@/lib/types';

interface Props {
  courses: CourseFolder[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  READY_FOR_PILOT: { label: 'מוכן לפיילוט', color: 'bg-green-100 text-green-700' },
  running: { label: 'בתהליך', color: 'bg-blue-100 text-blue-700' },
  error: { label: 'שגיאה', color: 'bg-red-100 text-red-700' },
  unknown: { label: 'לא ידוע', color: 'bg-gray-100 text-gray-500' },
};

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('he-IL', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function CourseList({ courses }: Props) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">📂</p>
        <p className="text-xl font-medium text-gray-600">אין קורסים עדיין</p>
        <p className="text-sm mt-2">לחץ על &quot;קורס חדש&quot; כדי להתחיל</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {courses.map(course => {
        const statusInfo = STATUS_LABELS[course.status] || STATUS_LABELS.unknown;
        return (
          <Link
            key={course.slug}
            href={`/course/${course.slug}`}
            className="block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all p-5 group"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            <div className="text-xs font-mono text-gray-400 mb-3">{course.slug}</div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{course.files.length} קבצים</span>
              {course.createdAt && <span>{formatDate(course.createdAt)}</span>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
