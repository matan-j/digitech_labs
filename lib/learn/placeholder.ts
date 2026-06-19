import type { GuideContentKind } from './types';
import { youtubeIdFromUrl, youtubeThumbnailUrl } from './youtube';

/**
 * Resolve the best thumbnail URL for a guide, in priority order:
 *   1. Explicit cover_url
 *   2. YouTube auto-thumbnail (for youtube kind, from content_url or video_url)
 * Returns null when no image is available — the UI then renders a branded
 * gradient placeholder (see GuideThumbnail).
 */
export function resolveGuideThumbnail(input: {
  cover_url?: string | null;
  content_kind?: GuideContentKind | null;
  content_url?: string | null;
  video_url?: string | null;
}): string | null {
  if (input.cover_url) return input.cover_url;

  const kind = input.content_kind;
  if (kind === 'youtube') {
    const id = youtubeIdFromUrl(input.content_url) ?? youtubeIdFromUrl(input.video_url);
    if (id) return youtubeThumbnailUrl(id, 'hq');
  }
  return null;
}

/** Hebrew label per content kind (badges). */
export const CONTENT_KIND_LABEL: Record<GuideContentKind, string> = {
  youtube: 'וידאו YouTube',
  vimeo: 'וידאו Vimeo',
  pdf: 'מסמך PDF',
  link: 'קישור חיצוני',
  article: 'מאמר',
};

/** Short label per content kind (compact card badge). */
export const CONTENT_KIND_SHORT: Record<GuideContentKind, string> = {
  youtube: 'וידאו',
  vimeo: 'וידאו',
  pdf: 'PDF',
  link: 'קישור',
  article: 'מאמר',
};

export function contentKindLabel(kind: GuideContentKind | null | undefined): string {
  return kind ? CONTENT_KIND_LABEL[kind] : CONTENT_KIND_LABEL.article;
}
