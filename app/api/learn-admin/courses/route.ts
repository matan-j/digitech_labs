import { NextRequest, NextResponse } from 'next/server';
import {
  learnCourseExists,
  listLearnCourses,
  saveLearnCourse,
} from '@/lib/learn/storage';
import type { Course } from '@/lib/learn/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const courses = await listLearnCourses();
  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  const slug = String(body.slug || '').trim();
  const title = String(body.title || '').trim();
  const tagline = String(body.tagline || '').trim();

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'slug חייב להיות אותיות לטיניות קטנות, ספרות ומקפים בלבד' },
      { status: 400 }
    );
  }
  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  if (await learnCourseExists(slug)) {
    return NextResponse.json(
      { error: 'קורס עם ה-slug הזה כבר קיים' },
      { status: 409 }
    );
  }

  const course: Course = {
    slug,
    title,
    tagline: tagline || '',
    description: '',
    audience: '',
    cover: 'hero',
    lessons: [],
    linkedAgents: [],
  };
  await saveLearnCourse(course);
  return NextResponse.json({ course });
}
