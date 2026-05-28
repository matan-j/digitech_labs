import { NextRequest, NextResponse } from 'next/server';
import { readFileBinary, getCourseDir } from '@/lib/fileSystem';
import path from 'path';

export const runtime = 'nodejs';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/plain; charset=utf-8',
};

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  const file = request.nextUrl.searchParams.get('file');

  if (!slug || !file) {
    return NextResponse.json({ error: 'Missing slug or file' }, { status: 400 });
  }

  // Security: prevent path traversal
  const courseDir = getCourseDir(slug);
  const fullPath = path.resolve(path.join(courseDir, file));
  if (!fullPath.startsWith(courseDir)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await readFileBinary(slug, file);
    const ext = path.extname(file).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new Response(data.buffer as ArrayBuffer, {
      headers: { 'Content-Type': contentType },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
