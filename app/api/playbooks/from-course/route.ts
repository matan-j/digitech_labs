import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/claude';
import { getPlaybookSystemPrompt, getPlaybookUserPrompt } from '@/lib/pipeline/prompts/playbook';
import type { CourseBrief } from '@/lib/types';
import { getCourseWithLessons } from '@/lib/learn/db';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: Request) {
  const { profile } = await requireAdmin();

  const body = await request.json().catch(() => ({}));
  const courseIdOrSlug: string | undefined = body.course_id ?? body.slug;
  if (!courseIdOrSlug) return NextResponse.json({ error: 'course_id_required' }, { status: 400 });

  // Resolve course by id or slug
  const supabase = await createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(courseIdOrSlug);
  const query = supabase.from('content_items').select('*').eq('type', 'course');
  const { data: course } = await (isUuid ? query.eq('id', courseIdOrSlug) : query.eq('slug', courseIdOrSlug)).maybeSingle();
  if (!course) return NextResponse.json({ error: 'course_not_found' }, { status: 404 });

  const full = await getCourseWithLessons(course.slug);
  if (!full) return NextResponse.json({ error: 'course_not_found' }, { status: 404 });

  const brief: CourseBrief = {
    title: full.title,
    slug: full.slug,
    targetAudience: full.audience ?? '',
    ageGroup: '',
    duration: `${full.lessons.length} שיעורים`,
    goal: full.description ?? full.tagline ?? '',
    prerequisites: '',
    format: 'course',
    tools: '',
    tone: 'practical',
    additionalNotes: '',
  };

  const syllabus = full.lessons
    .map((l, i) => `${i + 1}. ${l.title}${l.duration ? ` (${l.duration})` : ''}`)
    .join('\n');

  const lessonPlans = full.lessons
    .map((l) => `### ${l.num}. ${l.title}\n${l.body ?? '(אין תוכן)'}`)
    .join('\n\n');

  const onePager = [full.tagline, full.description].filter(Boolean).join('\n\n');

  const videoLinks: Record<string, string> = {};
  for (const l of full.lessons) {
    if (l.vimeo_id) videoLinks[l.title] = `https://vimeo.com/${l.vimeo_id}`;
  }

  let html: string;
  try {
    html = await generateContent(
      getPlaybookSystemPrompt(),
      getPlaybookUserPrompt(brief, syllabus, lessonPlans, onePager, videoLinks),
    );
  } catch (err) {
    console.error('[playbooks/from-course] Claude error:', err);
    return NextResponse.json({ error: 'claude_failed', message: err instanceof Error ? err.message : 'unknown' }, { status: 500 });
  }

  // Strip optional ```html ... ``` fences
  html = html.trim().replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();

  const { data: playbook, error } = await supabase
    .from('playbooks')
    .insert({
      source_type: 'course',
      source_id: full.id,
      title: `Playbook: ${full.title}`,
      html_content: html,
      audience: full.audience,
      created_by: profile.id,
    })
    .select('*')
    .single();
  if (error) {
    console.error('[playbooks/from-course] insert error:', error);
    return NextResponse.json({ error: 'save_failed', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: playbook.id, title: playbook.title });
}
