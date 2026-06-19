import { getCurrentUser, getMyCreator } from '@/lib/auth';
import { parseYouTubeInput, youtubeUrl } from './youtube';
import { parseVimeoInput, vimeoUrl } from './vimeo';
import type { GuideContentKind } from './types';

export type WriteActor =
  | { kind: 'admin'; userId: string; creatorId: string | null }
  | { kind: 'creator'; userId: string; creatorId: string }
  | { kind: 'none' };

/** Resolve who is performing a content write: admin, owning creator, or nobody. */
export async function resolveWriteActor(): Promise<WriteActor> {
  const auth = await getCurrentUser();
  if (!auth) return { kind: 'none' };
  if (auth.profile.role === 'admin') {
    const c = await getMyCreator();
    return { kind: 'admin', userId: auth.userId, creatorId: c?.id ?? null };
  }
  if (auth.profile.role === 'creator') {
    const c = await getMyCreator();
    if (c && c.status === 'active') return { kind: 'creator', userId: auth.userId, creatorId: c.id };
  }
  return { kind: 'none' };
}

/**
 * Validate + normalize a guide's content_url for the given kind.
 * Returns the canonical url to store, or an error message (Hebrew) if invalid.
 */
export function validateContentUrl(
  kind: GuideContentKind | null | undefined,
  url: string | null | undefined,
): { ok: true; value: string | null } | { ok: false; message: string } {
  if (!kind || kind === 'article') return { ok: true, value: null };
  const trimmed = (url ?? '').trim();

  if (kind === 'youtube') {
    if (!trimmed) return { ok: false, message: 'חסר קישור YouTube. הדבק קישור תקין לסרטון.' };
    const parsed = parseYouTubeInput(trimmed);
    if (!parsed) return { ok: false, message: 'קישור YouTube לא תקין. הדבק קישור מלא או מזהה סרטון.' };
    return { ok: true, value: youtubeUrl(parsed) };
  }
  if (kind === 'vimeo') {
    if (!trimmed) return { ok: false, message: 'חסר קישור Vimeo. הדבק קישור תקין לסרטון.' };
    const parsed = parseVimeoInput(trimmed);
    if (!parsed) return { ok: false, message: 'קישור Vimeo לא תקין. הדבק קישור מלא או מספר ID.' };
    return { ok: true, value: vimeoUrl(parsed) };
  }
  if (kind === 'pdf') {
    if (!trimmed) return { ok: false, message: 'חסר קובץ PDF. העלה קובץ או הדבק כתובת.' };
    return { ok: true, value: trimmed };
  }
  if (kind === 'link') {
    if (!trimmed) return { ok: false, message: 'חסר קישור חיצוני.' };
    try {
      const u = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
      return { ok: true, value: u.toString() };
    } catch {
      return { ok: false, message: 'הקישור החיצוני אינו תקין.' };
    }
  }
  return { ok: true, value: trimmed || null };
}
