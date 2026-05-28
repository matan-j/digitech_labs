import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import type { Lesson } from '@/lib/learn/types';

export default function PrevNextNav({
  courseSlug,
  prev,
  next,
}: {
  courseSlug: string;
  prev?: Lesson;
  next?: Lesson;
}) {
  return (
    <nav className="grid grid-cols-2 gap-3 mt-2">
      {prev ? (
        <Link
          href={`/learn/courses/${courseSlug}/${prev.slug}`}
          className="
            flex items-center gap-2 px-4 sm:px-5 py-3.5
            rounded-md border border-neutral-200 bg-white
            hover:border-brand-purple-300 hover:bg-brand-purple-50
            text-neutral-700 transition-colors
            min-w-0
          "
        >
          <ArrowRight className="w-4 h-4 text-neutral-500 shrink-0" />
          <span className="min-w-0">
            <span className="block text-[11px] text-neutral-500">השיעור הקודם</span>
            <span className="block text-sm font-semibold text-neutral-950 truncate">
              {prev.title}
            </span>
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={`/learn/courses/${courseSlug}/${next.slug}`}
          className="
            flex items-center gap-2 px-4 sm:px-5 py-3.5
            rounded-md bg-brand-purple-700 hover:bg-brand-purple-600
            text-white transition-colors
            min-w-0 justify-end
          "
        >
          <span className="min-w-0 text-right">
            <span className="block text-[11px] text-brand-purple-200">
              השיעור הבא
            </span>
            <span className="block text-sm font-semibold truncate">
              {next.title}
            </span>
          </span>
          <ArrowLeft className="w-4 h-4 shrink-0" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
