import Link from 'next/link';
import { ArrowLeft, Clock, Layers } from 'lucide-react';
import type { Course } from '@/lib/learn/types';

export default function CourseCard({ course }: { course: Course }) {
  const totalLessons = course.lessons.length;

  return (
    <Link
      href={`/learn/courses/${course.slug}`}
      className="
        group block bg-white rounded-card border border-brand-purple-200
        hover:border-brand-purple-400 transition-all overflow-hidden
      "
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Cover */}
      <div
        className={[
          'aspect-[16/9] relative',
          course.cover === 'header' ? 'bg-brand-purple-900' : 'bg-brand-purple-700',
        ].join(' ')}
        style={{
          backgroundImage:
            course.cover === 'header'
              ? 'linear-gradient(180deg, #1A0F3D 0%, #2E1758 100%)'
              : 'linear-gradient(135deg, #2E1758 0%, #4B2A84 60%, #5B35A0 100%)',
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 30%, rgba(196,184,230,0.35), transparent 55%), radial-gradient(circle at 20% 80%, rgba(15,10,31,0.6), transparent 55%)',
          }}
        />
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          {course.audience && (
            <span className="self-start inline-flex items-center text-[11px] font-semibold uppercase tracking-wider text-brand-purple-100 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-pill">
              {course.audience}
            </span>
          )}
          <h3 className="mt-2 text-white font-extrabold text-lg leading-tight line-clamp-2">
            {course.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-sm text-neutral-500 line-clamp-2 mb-4 min-h-[2.6em]">
          {course.tagline}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {totalLessons} שיעורים
            </span>
            {course.lastUpdated && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.lastUpdated}
              </span>
            )}
          </div>
          <span
            className="
              inline-flex items-center gap-1.5 text-sm font-semibold
              text-brand-purple-700
              group-hover:text-brand-purple-600 transition-colors
            "
          >
            התחל
            <ArrowLeft className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
