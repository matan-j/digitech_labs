import { notFound } from 'next/navigation';
import { getLearnCourse } from '@/lib/learn/storage';
import CourseEditor from '@/components/learn-admin/CourseEditor';

export const dynamic = 'force-dynamic';

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course: slug } = await params;
  const course = await getLearnCourse(slug);
  if (!course) notFound();
  return <CourseEditor initialCourse={course} />;
}
