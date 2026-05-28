import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { listLearnCourses, ensureSeed } from '@/lib/learn/storage';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * One-shot importer: reads every filesystem `learn.json` under `$COURSES_DIR`
 * and inserts a matching `content_items` (type='course') + `lessons` rows.
 * Idempotent on slug: existing courses are updated, not duplicated.
 */
export async function POST() {
  const { profile } = await requireAdmin();
  await ensureSeed();

  const legacy = await listLearnCourses();
  if (legacy.length === 0) {
    return NextResponse.json({ imported: 0, skipped: 0, note: 'no_filesystem_courses_found' });
  }

  const admin = createServiceClient();
  let imported = 0;
  let skipped = 0;
  const errors: { slug: string; message: string }[] = [];

  for (const course of legacy) {
    try {
      const { data: existing } = await admin
        .from('content_items')
        .select('id')
        .eq('type', 'course')
        .eq('slug', course.slug)
        .maybeSingle();

      let courseId: string;
      if (existing) {
        courseId = existing.id;
        await admin
          .from('content_items')
          .update({
            title: course.title,
            tagline: course.tagline,
            description: course.description,
            audience: course.audience ?? null,
            cover_style: course.cover ?? 'hero',
          })
          .eq('id', courseId);
        skipped++;
      } else {
        const { data: inserted, error } = await admin
          .from('content_items')
          .insert({
            type: 'course',
            slug: course.slug,
            title: course.title,
            tagline: course.tagline,
            description: course.description,
            audience: course.audience ?? null,
            cover_style: course.cover ?? 'hero',
            status: 'published',
            is_premium: true,
            tags: [],
            created_by: profile.id,
            published_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        if (error || !inserted) throw new Error(error?.message ?? 'insert_failed');
        courseId = inserted.id;
        imported++;
      }

      // Wipe & reinsert lessons (simpler than diffing, and migration is one-shot)
      await admin.from('lessons').delete().eq('course_id', courseId);

      if (course.lessons?.length) {
        const rows = course.lessons.map((l, idx) => ({
          course_id: courseId,
          num: l.num,
          slug: l.slug,
          title: l.title,
          vimeo_id: l.vimeoId || null,
          duration: l.duration || null,
          body: l.body || null,
          position: idx,
        }));
        const { data: createdLessons, error: lErr } = await admin
          .from('lessons')
          .insert(rows)
          .select('id, slug');
        if (lErr) throw new Error(lErr.message);

        // Insert resources
        const resourceRows: Array<{ owner_type: 'lesson'; owner_id: string; title: string; url: string; size_mb: number | null; kind: 'pdf' | 'xlsx' | 'docx' | 'link' | null }> = [];
        for (const l of course.lessons) {
          const newLesson = (createdLessons ?? []).find((cl) => cl.slug === l.slug);
          if (!newLesson || !l.resources) continue;
          for (const r of l.resources) {
            resourceRows.push({
              owner_type: 'lesson',
              owner_id: newLesson.id,
              title: r.title,
              url: r.url,
              size_mb: r.sizeMB ?? null,
              kind: r.kind ?? null,
            });
          }
        }
        if (resourceRows.length) {
          const { error: rErr } = await admin.from('resources').insert(resourceRows);
          if (rErr) console.warn('[import] resource insert failed', rErr.message);
        }
      }
    } catch (err) {
      errors.push({ slug: course.slug, message: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ imported, updated: skipped, errors });
}
