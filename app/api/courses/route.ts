import { NextRequest, NextResponse } from 'next/server';
import { listCourses, listCourseFiles, readFile } from '@/lib/fileSystem';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const file = searchParams.get('file');

  // Read specific file content
  if (slug && file) {
    try {
      const content = await readFile(slug, file);
      return NextResponse.json({ content });
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  }

  // List files for a specific course
  if (slug) {
    try {
      const files = await listCourseFiles(slug);
      return NextResponse.json({ files });
    } catch {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
  }

  // List all courses
  try {
    const courses = await listCourses();
    return NextResponse.json({ courses });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
