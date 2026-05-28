import fs from 'fs/promises';
import path from 'path';
import { CourseBrief, CourseFolder } from './types';

const COURSES_DIR = process.env.COURSES_DIR || path.join(process.env.HOME || '', 'Documents', 'Digitech-Courses');

export function getCourseDir(slug: string): string {
  return path.join(COURSES_DIR, `Course_${slug}`);
}

export async function ensureCourseDir(slug: string): Promise<void> {
  const base = getCourseDir(slug);
  const dirs = [
    base,
    path.join(base, 'Research'),
    path.join(base, 'Curriculum'),
    path.join(base, 'Slides'),
    path.join(base, 'Interactive'),
    path.join(base, 'Marketing'),
    path.join(base, 'QA'),
  ];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function writeFile(slug: string, relativePath: string, content: string): Promise<string> {
  const fullPath = path.join(getCourseDir(slug), relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
  return relativePath;
}

export async function writeFileBinary(slug: string, relativePath: string, data: Buffer): Promise<string> {
  const fullPath = path.join(getCourseDir(slug), relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, data);
  return relativePath;
}

export async function readFileBinary(slug: string, relativePath: string): Promise<Buffer> {
  const fullPath = path.join(getCourseDir(slug), relativePath);
  return fs.readFile(fullPath);
}

export async function readFile(slug: string, relativePath: string): Promise<string> {
  const fullPath = path.join(getCourseDir(slug), relativePath);
  return fs.readFile(fullPath, 'utf-8');
}

export async function writeStatus(slug: string, status: object): Promise<void> {
  await writeFile(slug, 'status.json', JSON.stringify(status, null, 2));
}

export async function readStatus(slug: string): Promise<Record<string, unknown> | null> {
  try {
    const content = await readFile(slug, 'status.json');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function writeBrief(slug: string, brief: CourseBrief): Promise<void> {
  const md = `# Course Brief: ${brief.title}

## פרטי הקורס
- **שם הקורס:** ${brief.title}
- **Slug:** ${brief.slug}
- **קהל יעד:** ${brief.targetAudience}
- **גיל:** ${brief.ageGroup}
- **משך הקורס:** ${brief.duration}
- **פורמט:** ${brief.format}
- **כלים:** ${brief.tools}
- **טון:** ${brief.tone}

## מטרת הקורס
${brief.goal}

## ידע קודם נדרש
${brief.prerequisites || 'אין'}

## הערות נוספות
${brief.additionalNotes || 'אין'}

---
*נוצר בתאריך: ${new Date().toLocaleDateString('he-IL')}*
`;
  await writeFile(slug, 'Course_Brief.md', md);
}

export async function listCourses(): Promise<CourseFolder[]> {
  try {
    await fs.mkdir(COURSES_DIR, { recursive: true });
    const entries = await fs.readdir(COURSES_DIR, { withFileTypes: true });
    const courses: CourseFolder[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith('Course_')) continue;
      const slug = entry.name.replace('Course_', '');
      const statusData = await readStatus(slug);
      const allFiles = await listCourseFiles(slug);

      courses.push({
        slug,
        title: (statusData?.title as string) || slug,
        status: (statusData?.pipelineStatus as string) || 'unknown',
        createdAt: (statusData?.createdAt as string) || '',
        files: allFiles,
      });
    }

    return courses.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function listCourseFiles(slug: string): Promise<string[]> {
  const baseDir = getCourseDir(slug);
  const result: string[] = [];

  async function walk(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          result.push(path.relative(baseDir, fullPath));
        }
      }
    } catch {
      // dir doesn't exist yet
    }
  }

  await walk(baseDir);
  return result;
}
