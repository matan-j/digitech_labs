import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listContent } from '@/lib/learn/db';
import type { GrantableResource } from '@/lib/learn/registration-rules';

/** Options for the rule editor's resource multi-picker: courses + bundles. */
export async function GET() {
  await requireAdmin();
  const [courses, bundles] = await Promise.all([listContent('course'), listContent('bundle')]);
  const toOption = (type: 'course' | 'bundle') => (c: { id: string; title: string }): GrantableResource => ({
    id: c.id,
    title: c.title,
    type,
  });
  return NextResponse.json({
    courses: courses.map(toOption('course')),
    bundles: bundles.map(toOption('bundle')),
  });
}
