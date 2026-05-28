import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, readStatus } from '@/lib/fileSystem';
import { generateContent } from '@/lib/claude';
import { getPlaybookSystemPrompt, getPlaybookUserPrompt } from '@/lib/pipeline/prompts/playbook';
import { CourseBrief } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

function parseVideoLinks(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const match = line.match(/^(.+?):\s*(https?:\/\/.+)$/);
    if (match) result[match[1].trim()] = match[2].trim();
  }
  return result;
}

export async function POST(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  let body: {
    videoLinks?: Record<string, string>;
    videoLinksRaw?: string;
    // for direct content mode (no slug):
    title?: string;
    targetAudience?: string;
    ageGroup?: string;
    content?: string; // raw pasted/uploaded content
  } = {};

  try { body = await request.json(); } catch { /* ok */ }

  const videoLinks: Record<string, string> =
    body.videoLinks ||
    (body.videoLinksRaw ? parseVideoLinks(body.videoLinksRaw) : {});

  let brief: CourseBrief;
  let syllabus = '';
  let lessonPlans = '';
  let onePager = '';
  let outputSlug = '';

  if (slug) {
    // Mode A: from existing course files
    const [syl, one, status] = await Promise.all([
      readFile(slug, 'Curriculum/Syllabus.md').catch(() => ''),
      readFile(slug, 'Curriculum/OnePager_Product.md').catch(() => ''),
      readStatus(slug),
    ]);
    const lp = await Promise.all([
      readFile(slug, 'Curriculum/Lesson_Plans.md').catch(() => ''),
      readFile(slug, 'Curriculum/Lesson_Plans_Part2.md').catch(() => ''),
      readFile(slug, 'Curriculum/Lesson_Plans_Part3.md').catch(() => ''),
    ]).then(parts => parts.filter(Boolean).join('\n\n'));

    if (!syl) return NextResponse.json({ error: 'Course content not found. Run the pipeline first.' }, { status: 404 });

    syllabus = syl;
    lessonPlans = lp;
    onePager = one;
    outputSlug = slug;
    brief = {
      slug,
      title: (status?.title as string) || slug,
      targetAudience: (status?.targetAudience as string) || '',
      ageGroup: (status?.ageGroup as string) || '',
      duration: (status?.duration as string) || '',
      format: '', tools: '', tone: '',
      goal: (status?.goal as string) || '',
      prerequisites: '', additionalNotes: '',
    };
  } else {
    // Mode B: direct content upload
    if (!body.content || !body.title) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }
    syllabus = body.content;
    outputSlug = body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').slice(0, 40);
    brief = {
      slug: outputSlug,
      title: body.title,
      targetAudience: body.targetAudience || '',
      ageGroup: body.ageGroup || '',
      duration: '', format: '', tools: '', tone: '', goal: '',
      prerequisites: '', additionalNotes: '',
    };
  }

  const html = await generateContent(
    getPlaybookSystemPrompt(),
    getPlaybookUserPrompt(brief, syllabus, lessonPlans, onePager, videoLinks),
  );

  const cleaned = html
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  await writeFile(outputSlug, 'playbook.html', cleaned);

  return NextResponse.json({ ok: true, url: `/playbook/${outputSlug}`, slug: outputSlug });
}
