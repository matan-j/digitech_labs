import { createClient } from '@/lib/supabase/server';

const BUCKET = 'brand';
const LOGO_PREFIX = 'logo';

/**
 * Returns the public URL of the current brand logo, or null if none was uploaded.
 * The file name is `logo.<ext>` — we list the bucket and pick the most recent one,
 * so admin uploads with any image extension (png/svg/jpg/webp) just work.
 */
export async function getBrandLogoUrl(): Promise<string | null> {
  try {
    const supa = await createClient();
    const { data: files, error } = await supa.storage
      .from(BUCKET)
      .list('', { limit: 20, sortBy: { column: 'created_at', order: 'desc' } });
    if (error || !files) return null;
    const logo = files.find((f) => f.name.startsWith(LOGO_PREFIX));
    if (!logo) return null;
    const { data } = supa.storage.from(BUCKET).getPublicUrl(logo.name);
    // Cache-bust per-request so a freshly uploaded logo shows immediately.
    return `${data.publicUrl}?v=${encodeURIComponent(logo.updated_at ?? logo.created_at ?? '')}`;
  } catch {
    return null;
  }
}

export { BUCKET as BRAND_BUCKET, LOGO_PREFIX as BRAND_LOGO_PREFIX };
