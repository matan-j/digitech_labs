import { createClient } from '@/lib/supabase/server';

const BUCKET = 'brand';
const LOGO_PREFIX = 'logo';
const COVER_PREFIX = 'cover';

export type SocialKey =
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'youtube'
  | 'tiktok'
  | 'x'
  | 'website';

export type BrandSettings = {
  logoUrl: string | null;
  coverUrl: string | null;
  social: Record<SocialKey, string | null>;
};

type BrandSettingsRow = {
  cover_url: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_linkedin: string | null;
  social_youtube: string | null;
  social_tiktok: string | null;
  social_x: string | null;
  social_website: string | null;
};

const EMPTY_SOCIAL: Record<SocialKey, string | null> = {
  instagram: null,
  facebook: null,
  linkedin: null,
  youtube: null,
  tiktok: null,
  x: null,
  website: null,
};

async function findStorageAsset(
  prefix: string,
): Promise<{ url: string; key: string; cacheBust: string } | null> {
  try {
    const supa = await createClient();
    const { data: files, error } = await supa.storage
      .from(BUCKET)
      .list('', { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });
    if (error || !files) return null;
    const file = files.find((f) => f.name.startsWith(prefix));
    if (!file) return null;
    const { data } = supa.storage.from(BUCKET).getPublicUrl(file.name);
    const stamp = encodeURIComponent(file.updated_at ?? file.created_at ?? '');
    return { url: `${data.publicUrl}?v=${stamp}`, key: file.name, cacheBust: stamp };
  } catch {
    return null;
  }
}

export async function getBrandLogoUrl(): Promise<string | null> {
  const found = await findStorageAsset(LOGO_PREFIX);
  return found?.url ?? null;
}

export async function getBrandCoverUrl(): Promise<string | null> {
  const found = await findStorageAsset(COVER_PREFIX);
  return found?.url ?? null;
}

/**
 * Returns the full brand bundle (logo + cover + social links) in one round-trip.
 * Used by layouts and the admin brand page.
 */
export async function getBrandSettings(): Promise<BrandSettings> {
  try {
    const supa = await createClient();
    const [logoUrl, coverUrl, row] = await Promise.all([
      getBrandLogoUrl(),
      getBrandCoverUrl(),
      supa
        .from('brand_settings')
        .select(
          'cover_url, social_instagram, social_facebook, social_linkedin, social_youtube, social_tiktok, social_x, social_website',
        )
        .eq('id', 1)
        .maybeSingle()
        .then((r) => r.data as BrandSettingsRow | null),
    ]);

    return {
      logoUrl,
      // Prefer freshly uploaded cover from storage; fall back to manual URL in brand_settings.cover_url.
      coverUrl: coverUrl ?? row?.cover_url ?? null,
      social: row
        ? {
            instagram: row.social_instagram,
            facebook: row.social_facebook,
            linkedin: row.social_linkedin,
            youtube: row.social_youtube,
            tiktok: row.social_tiktok,
            x: row.social_x,
            website: row.social_website,
          }
        : EMPTY_SOCIAL,
    };
  } catch {
    return { logoUrl: null, coverUrl: null, social: EMPTY_SOCIAL };
  }
}

export {
  BUCKET as BRAND_BUCKET,
  LOGO_PREFIX as BRAND_LOGO_PREFIX,
  COVER_PREFIX as BRAND_COVER_PREFIX,
};
