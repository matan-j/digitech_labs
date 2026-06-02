import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getCourseWithLessons } from '@/lib/learn/db';
import BulkImportLessons from '@/components/learn-admin/BulkImportLessons';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCourseWithLessons(slug);
  return { title: c ? `${c.title} — ייבוא שיעורים` : 'קורס לא נמצא' };
}

export default async function BulkImportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseWithLessons(slug);
  if (!course) notFound();

  return (
    <div className="px-8 py-8 max-w-4xl">
      <Link
        href={`/admin/courses/${slug}`}
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4"
      >
        <ArrowRight className="w-3.5 h-3.5" />
        חזרה לעריכת הקורס
      </Link>

      <BulkImportLessons
        courseSlug={slug}
        courseTitle={course.title}
        existingLessonCount={course.lessons.length}
      />
    </div>
  );
}
