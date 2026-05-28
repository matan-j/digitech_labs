import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import type { Course } from './types';
import { ensureCourseDir, getCourseDir, readFile, writeFile } from '@/lib/fileSystem';
import { SEED_COURSES } from './seed';

const COURSES_DIR =
  process.env.COURSES_DIR ||
  path.join(process.env.HOME || '', 'Documents', 'Digitech-Courses');

const LEARN_FILE = 'learn.json';

let didSeedThisProcess = false;

// On first call within a process, if no Course_<slug>/learn.json exists
// anywhere, write the SEED_COURSES to disk. Idempotent.
export async function ensureSeed(): Promise<void> {
  if (didSeedThisProcess) return;
  didSeedThisProcess = true;
  try {
    await fs.mkdir(COURSES_DIR, { recursive: true });
    const entries = await fs.readdir(COURSES_DIR, { withFileTypes: true });
    let found = false;
    for (const e of entries) {
      if (!e.isDirectory() || !e.name.startsWith('Course_')) continue;
      const candidate = path.join(COURSES_DIR, e.name, LEARN_FILE);
      try {
        await fs.access(candidate);
        found = true;
        break;
      } catch {
        // not present, keep looking
      }
    }
    if (found) return;
    for (const c of SEED_COURSES) {
      await saveLearnCourse(c);
    }
  } catch {
    // best-effort
  }
}

export async function listLearnCourses(): Promise<Course[]> {
  await ensureSeed();
  try {
    await fs.mkdir(COURSES_DIR, { recursive: true });
    const entries = await fs.readdir(COURSES_DIR, { withFileTypes: true });
    const out: Course[] = [];
    for (const e of entries) {
      if (!e.isDirectory() || !e.name.startsWith('Course_')) continue;
      const slug = e.name.replace(/^Course_/, '');
      const c = await getLearnCourse(slug);
      if (c) out.push(c);
    }
    // newest lastUpdated first when present, then by title
    out.sort((a, b) => {
      const au = a.lastUpdated || '';
      const bu = b.lastUpdated || '';
      if (au !== bu) return bu.localeCompare(au);
      return a.title.localeCompare(b.title);
    });
    return out;
  } catch {
    return [];
  }
}

export async function getLearnCourse(slug: string): Promise<Course | null> {
  try {
    const raw = await readFile(slug, LEARN_FILE);
    const parsed = JSON.parse(raw) as Course;
    // light validation — ensure required arrays exist
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.lessons)) parsed.lessons = [];
    return parsed;
  } catch {
    return null;
  }
}

export async function saveLearnCourse(course: Course): Promise<void> {
  if (!course.slug) throw new Error('course.slug is required');
  await ensureCourseDir(course.slug);
  // Re-number lessons sequentially in case caller reordered without updating.
  const normalized: Course = {
    ...course,
    lessons: course.lessons.map((l, i) => ({
      ...l,
      num: i + 1,
      slug: l.slug && l.slug.trim() ? l.slug.trim() : String(i + 1),
    })),
    lastUpdated: course.lastUpdated || formatDateIL(new Date()),
  };
  await writeFile(course.slug, LEARN_FILE, JSON.stringify(normalized, null, 2));
}

export async function deleteLearnCourse(slug: string): Promise<void> {
  const file = path.join(getCourseDir(slug), LEARN_FILE);
  try {
    await fs.unlink(file);
  } catch {
    // already gone
  }
}

export async function learnCourseExists(slug: string): Promise<boolean> {
  try {
    await fs.access(path.join(getCourseDir(slug), LEARN_FILE));
    return true;
  } catch {
    return false;
  }
}

function formatDateIL(d: Date) {
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}
