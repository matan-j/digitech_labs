import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getLesson } from '@/lib/learn/courses';
import RichContentRenderer from '@/components/learn/RichContentRenderer';
import ContentTableOfContents from '@/components/learn/ContentTableOfContents';
import { toRichBlocks, extractToc } from '@/lib/learn/rich-content';
import { getCurrentUser, hasPremiumAccess } from '@/lib/auth';
import { hasActiveEntitlement } from '@/lib/payments/entitlement-service';
import { getCompletedLessonIds, getCourseWithLessons, getCourseWithModules } from '@/lib/learn/db';
import VimeoPlayer from '@/components/learn/VimeoPlayer';
import CourseSidebar from '@/components/learn/CourseSidebar';
import ResourcesCard from '@/components/learn/ResourcesCard';
import PrevNextNav from '@/components/learn/PrevNextNav';
import MarkCompleteButton from '@/components/learn/MarkCompleteButton';

export const dynamic = 'force-dynamic';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const data = await getLesson(courseSlug, lessonSlug);
  if (!data) {
    // getLesson reads the RLS-gated base tables only. A null result can mean the
    // course/lesson genuinely doesn't exist OR the viewer simply lacks DB-level
    // access (e.g. a purchase_required course they haven't bought yet). Don't
    // hard-404 the latter: if the course exists in the public metadata view,
    // send them to the landing where the login/purchase gate + CTA live — the
    // same fallback the course landing page itself uses. Only a truly missing
    // course is a real 404.
    const publicCourse = await getCourseWithModules(courseSlug, { source: 'public' });
    if (publicCourse) redirect(`/learn/courses/${courseSlug}`);
    notFound();
  }
  const { course, lesson, prev, next, lessonId, isPremium, accessLevel, courseId, hardLocked } = data;

  // Table of contents only for long written lessons (3+ H2 sections).
  const lessonToc = lesson.body ? extractToc(toRichBlocks(lesson.body)) : [];

  const returnTo = `/learn/courses/${courseSlug}/${lessonSlug}`;
  const auth = await getCurrentUser();

  // Per-lesson lock model: an UNLOCKED lesson (the lesson + its chapter + its
  // module are all unlocked) is FREE for everyone — no gate. A LOCKED lesson
  // requires the course's access (membership / purchase / login); buyers,
  // members and admins see it, everyone else is sent to the landing CTA.
  if (hardLocked) {
    // Membership (is_premium / subscription_required). A per-course entitlement
    // (purchase / admin / gift) unlocks it like a live membership does.
    if (isPremium) {
      if (!auth) redirect(`/login?return=${encodeURIComponent(returnTo)}`);
      const entitled = hasPremiumAccess(auth.profile) || (await hasActiveEntitlement('course', courseId));
      if (!entitled) redirect(`/upgrade?return=${encodeURIComponent(returnTo)}`);
    }
    // login_required courses: a locked lesson needs a session.
    if (accessLevel === 'login_required' && !auth) {
      redirect(`/login?return=${encodeURIComponent(returnTo)}`);
    }
    // purchase_required: a locked lesson needs an active entitlement
    // (admins/members exempt). Others go to the landing where the CTA lives.
    if (accessLevel === 'purchase_required') {
      if (!auth) redirect(`/login?return=${encodeURIComponent(returnTo)}`);
      const entitled = hasPremiumAccess(auth.profile) || (await hasActiveEntitlement('course', courseId));
      if (!entitled) redirect(`/learn/courses/${courseSlug}`);
    }
  }
  // Resolve completed lesson slugs (CourseSidebar expects slugs, not UUIDs)
  let completedSlugs: string[] = [];
  if (auth) {
    const courseFull = await getCourseWithLessons(courseSlug);
    if (courseFull) {
      const completedIds = await getCompletedLessonIds(auth.userId, courseFull.id);
      const idToSlug = new Map(courseFull.lessons.map((l) => [l.id, l.slug] as const));
      completedSlugs = completedIds.map((id) => idToSlug.get(id)).filter((s): s is string => !!s);
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-5">
        <Link
          href="/learn/courses"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-700 hover:text-brand-purple-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה לקורסים
        </Link>
      </div>

      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-purple-700">{course.title}</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 mt-1 leading-tight">
          שיעור {lesson.num} · {lesson.title}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          {lesson.vimeoId && (
            <div className="bg-white rounded-xl border border-neutral-200 p-3 sm:p-4">
              <VimeoPlayer vimeoId={lesson.vimeoId} title={lesson.title} />
            </div>
          )}

          <article className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6">
            <header className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <h2 className="text-xl font-extrabold text-neutral-950 flex-1 min-w-0">{lesson.title}</h2>
              {lessonId && (
                <MarkCompleteButton
                  courseSlug={course.slug}
                  lessonSlug={lesson.slug}
                  lessonId={lessonId}
                  initialCompleted={completedSlugs.includes(lesson.slug)}
                />
              )}
            </header>

            {lesson.body ? (
              <>
                {lessonToc.length >= 3 && (
                  <div className="mb-5">
                    <ContentTableOfContents entries={lessonToc} variant="inline" title="בשיעור הזה" />
                  </div>
                )}
                <RichContentRenderer content={lesson.body} />
              </>
            ) : (
              <p className="text-neutral-400 italic">אין תוכן טקסטואלי לשיעור זה.</p>
            )}
          </article>

          {lesson.resources && lesson.resources.length > 0 && (
            <ResourcesCard resources={lesson.resources} />
          )}

          <PrevNextNav courseSlug={course.slug} prev={prev} next={next} />
        </div>

        <CourseSidebar
          course={course}
          activeLessonSlug={lesson.slug}
          completedLessonSlugs={completedSlugs}
        />
      </div>
    </div>
  );
}
