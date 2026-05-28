/**
 * Progress tracking via localStorage.
 * Key shape: digitech.progress.<courseSlug> -> { completed: string[] (lesson slugs) }
 */

export type CourseProgress = { completed: string[] };

const KEY_PREFIX = 'digitech.progress.';

export function readProgress(courseSlug: string): CourseProgress {
  if (typeof window === 'undefined') return { completed: [] };
  try {
    const raw = localStorage.getItem(KEY_PREFIX + courseSlug);
    if (!raw) return { completed: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.completed)) return { completed: [] };
    return { completed: parsed.completed.filter((s: unknown): s is string => typeof s === 'string') };
  } catch {
    return { completed: [] };
  }
}

export function writeProgress(courseSlug: string, value: CourseProgress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_PREFIX + courseSlug, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('digitech:progress', { detail: { courseSlug } }));
}

export function toggleCompleted(courseSlug: string, lessonSlug: string) {
  const cur = readProgress(courseSlug);
  const set = new Set(cur.completed);
  if (set.has(lessonSlug)) set.delete(lessonSlug);
  else set.add(lessonSlug);
  const next = { completed: Array.from(set) };
  writeProgress(courseSlug, next);
  return next;
}

export function markCompleted(courseSlug: string, lessonSlug: string) {
  const cur = readProgress(courseSlug);
  if (cur.completed.includes(lessonSlug)) return cur;
  const next = { completed: [...cur.completed, lessonSlug] };
  writeProgress(courseSlug, next);
  return next;
}

export function isCompleted(courseSlug: string, lessonSlug: string) {
  return readProgress(courseSlug).completed.includes(lessonSlug);
}
