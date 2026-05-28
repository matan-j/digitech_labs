import { NextRequest, NextResponse } from 'next/server';
import {
  deleteLearnCourse,
  getLearnCourse,
  saveLearnCourse,
} from '@/lib/learn/storage';
import type { Course, Lesson, Resource } from '@/lib/learn/types';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const course = await getLearnCourse(slug);
  if (!course) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ course });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || !body.course) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  const incoming = body.course as Course;
  // slug must match the URL slug — never let the client rename via PUT
  if (incoming.slug !== slug) {
    return NextResponse.json(
      { error: 'slug mismatch — לא ניתן לשנות slug של קורס דרך PUT' },
      { status: 400 }
    );
  }
  const sanitized = sanitizeCourse(incoming);
  await saveLearnCourse(sanitized);
  return NextResponse.json({ ok: true, course: sanitized });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await deleteLearnCourse(slug);
  return NextResponse.json({ ok: true });
}

function sanitizeCourse(c: Course): Course {
  return {
    slug: c.slug,
    title: String(c.title || '').trim(),
    tagline: String(c.tagline || '').trim(),
    description: String(c.description || ''),
    audience: c.audience ? String(c.audience).trim() : undefined,
    cover: c.cover === 'header' ? 'header' : 'hero',
    lastUpdated: c.lastUpdated,
    lessons: Array.isArray(c.lessons) ? c.lessons.map(sanitizeLesson) : [],
    linkedAgents: Array.isArray(c.linkedAgents)
      ? c.linkedAgents
          .filter((a) => a && (a.title || a.href))
          .map((a) => ({
            id: a.id || randomId(),
            title: String(a.title || '').trim(),
            href: String(a.href || '#').trim(),
          }))
      : [],
  };
}

function sanitizeLesson(l: Lesson, idx: number): Lesson {
  return {
    num: idx + 1,
    slug: l.slug && l.slug.trim() ? l.slug.trim() : String(idx + 1),
    title: String(l.title || '').trim(),
    vimeoId: String(l.vimeoId || '').trim(),
    duration: String(l.duration || '').trim(),
    body: String(l.body || ''),
    resources: Array.isArray(l.resources)
      ? l.resources.filter((r) => r && (r.title || r.url)).map(sanitizeResource)
      : [],
  };
}

function sanitizeResource(r: Resource): Resource {
  return {
    id: r.id || randomId(),
    title: String(r.title || '').trim(),
    url: String(r.url || '').trim(),
    sizeMB: typeof r.sizeMB === 'number' ? r.sizeMB : undefined,
    kind: r.kind === 'pdf' || r.kind === 'xlsx' || r.kind === 'docx' || r.kind === 'link' ? r.kind : 'link',
  };
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}
