import { createClient } from '@/lib/supabase/server';
import type {
  ContentItem,
  ContentType,
  CourseWithLessons,
  DbLesson,
  DbResource,
  GuideBlock,
  GuideItem,
  Playbook,
} from './types';

// ============================================================
// Reads — go through the request-scoped (RLS-aware) client
// ============================================================

async function db() {
  return await createClient();
}

// ----- Content items -----

export async function listContent(type: ContentType): Promise<ContentItem[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('type', type)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContentItem[];
}

export async function getContentBySlug(type: ContentType, slug: string): Promise<ContentItem | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('type', type)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as ContentItem | null;
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as ContentItem | null;
}

// ----- Courses (with lessons) -----

export async function getCourseWithLessons(slug: string): Promise<CourseWithLessons | null> {
  const supabase = await db();
  const { data: course, error: cErr } = await supabase
    .from('content_items')
    .select('*')
    .eq('type', 'course')
    .eq('slug', slug)
    .maybeSingle();
  if (cErr) throw cErr;
  if (!course) return null;

  const { data: lessons, error: lErr } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', course.id)
    .order('position', { ascending: true });
  if (lErr) throw lErr;

  // Fetch lesson-attached resources in a single round-trip
  const lessonIds = (lessons ?? []).map((l) => l.id);
  let resourcesByDbLesson: Record<string, DbResource[]> = {};
  if (lessonIds.length) {
    const { data: resources, error: rErr } = await supabase
      .from('resources')
      .select('*')
      .eq('owner_type', 'lesson')
      .in('owner_id', lessonIds);
    if (rErr) throw rErr;
    resourcesByDbLesson = (resources ?? []).reduce((acc, r) => {
      const list = acc[r.owner_id] ?? (acc[r.owner_id] = []);
      list.push(r as DbResource);
      return acc;
    }, {} as Record<string, DbResource[]>);
  }

  const enrichedDbLessons: DbLesson[] = (lessons ?? []).map((l) => ({
    ...(l as DbLesson),
    resources: resourcesByDbLesson[l.id] ?? [],
  }));

  return { ...(course as ContentItem), type: 'course', lessons: enrichedDbLessons };
}

export async function getDbLessonById(lessonId: string): Promise<DbLesson | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .maybeSingle();
  if (error) throw error;
  return data as DbLesson | null;
}

// ----- Guides -----

export async function getGuide(slug: string): Promise<GuideItem | null> {
  const item = await getContentBySlug('guide', slug);
  if (!item) return null;
  return {
    ...(item as ContentItem),
    type: 'guide',
    body: (item.body ?? []) as GuideBlock[],
  };
}

// ----- Playbooks -----

export async function listPlaybooks(): Promise<Playbook[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('playbooks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Playbook[];
}

export async function getPlaybook(id: string): Promise<Playbook | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('playbooks')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Playbook | null;
}

export async function listPlaybooksForCourse(courseId: string): Promise<Playbook[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('playbooks')
    .select('*')
    .eq('source_type', 'course')
    .eq('source_id', courseId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Playbook[];
}

// ----- Progress (server-side replacement for localStorage) -----

/**
 * Returns per-course aggregated progress {courseId: {done, total}}
 * for every published course this user can see.
 */
export async function progressByCourse(userId: string): Promise<Record<string, { done: number; total: number }>> {
  const supabase = await db();
  const { data: lessonRows, error } = await supabase
    .from('lessons')
    .select('id, course_id, content_items!inner(status)')
    .eq('content_items.status', 'published');
  if (error) {
    console.error('[progressByCourse:lessons]', error);
    return {};
  }
  type Row = { id: string; course_id: string };
  const rows = (lessonRows ?? []) as unknown as Row[];

  const totalByCourse = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.course_id] = (acc[r.course_id] ?? 0) + 1;
    return acc;
  }, {});

  const lessonIds = rows.map((r) => r.id);
  if (lessonIds.length === 0) return {};

  const { data: progRows } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);

  const lessonToCourse = new Map(rows.map((r) => [r.id, r.course_id] as const));
  const doneByCourse: Record<string, number> = {};
  for (const p of (progRows ?? []) as { lesson_id: string }[]) {
    const c = lessonToCourse.get(p.lesson_id);
    if (c) doneByCourse[c] = (doneByCourse[c] ?? 0) + 1;
  }

  const out: Record<string, { done: number; total: number }> = {};
  for (const [courseId, total] of Object.entries(totalByCourse)) {
    out[courseId] = { done: doneByCourse[courseId] ?? 0, total };
  }
  return out;
}

export async function getCompletedLessonIds(userId: string, courseId?: string): Promise<string[]> {
  const supabase = await db();
  if (courseId) {
    const { data, error } = await supabase
      .from('progress')
      .select('lesson_id, lessons!inner(course_id)')
      .eq('user_id', userId)
      .eq('lessons.course_id', courseId);
    if (error) throw error;
    return (data ?? []).map((r: { lesson_id: string }) => r.lesson_id);
  }
  const { data, error } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r: { lesson_id: string }) => r.lesson_id);
}

// ============================================================
// Admin counts — used by the /admin dashboard
// ============================================================

export async function adminCounts(): Promise<{
  courses: { total: number; published: number };
  guides: { total: number; published: number };
  playbooks: number;
}> {
  const supabase = await db();
  const [
    coursesTotal,
    coursesPublished,
    guidesTotal,
    guidesPublished,
    playbooks,
  ] = await Promise.all([
    supabase.from('content_items').select('id', { count: 'exact', head: true }).eq('type', 'course'),
    supabase.from('content_items').select('id', { count: 'exact', head: true }).eq('type', 'course').eq('status', 'published'),
    supabase.from('content_items').select('id', { count: 'exact', head: true }).eq('type', 'guide'),
    supabase.from('content_items').select('id', { count: 'exact', head: true }).eq('type', 'guide').eq('status', 'published'),
    supabase.from('playbooks').select('id', { count: 'exact', head: true }),
  ]);

  return {
    courses: { total: coursesTotal.count ?? 0, published: coursesPublished.count ?? 0 },
    guides: { total: guidesTotal.count ?? 0, published: guidesPublished.count ?? 0 },
    playbooks: playbooks.count ?? 0,
  };
}
