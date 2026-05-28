import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/** Returns the slugs of lessons in this course that the current user has completed. */
export async function GET(_request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ slugs: [] });

  const { slug } = await ctx.params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from('content_items')
    .select('id')
    .eq('type', 'course')
    .eq('slug', slug)
    .maybeSingle();
  if (!course) return NextResponse.json({ slugs: [] });

  const { data, error } = await supabase
    .from('progress')
    .select('lessons!inner(slug, course_id)')
    .eq('user_id', auth.userId)
    .eq('lessons.course_id', course.id);
  if (error) {
    console.error('[progress:course]', error);
    return NextResponse.json({ slugs: [] });
  }

  type Row = { lessons: { slug: string } | { slug: string }[] | null };
  const slugs = (data as Row[] ?? []).flatMap((r) => {
    const l = r.lessons;
    if (!l) return [];
    return Array.isArray(l) ? l.map((x) => x.slug) : [l.slug];
  });
  return NextResponse.json({ slugs });
}
