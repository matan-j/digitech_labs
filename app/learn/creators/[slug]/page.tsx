import { notFound } from 'next/navigation';
import {
  getCreatorBySlug,
  getCreatorStats,
  listGuidesByCreator,
  listPlaylistsByCreator,
  getPlaylistItemCounts,
} from '@/lib/learn/db';
import { getDomainMeta } from '@/lib/learn/domains';
import { youtubeIdFromUrl, youtubeEmbedUrl } from '@/lib/learn/youtube';
import { parseVimeoInput } from '@/lib/learn/vimeo';
import CreatorProfileView, { type IntroVideo, type ProfileTopic } from '@/components/creator/CreatorProfileView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCreatorBySlug(slug);
  if (!c) return { title: 'יוצר לא נמצא' };
  return {
    title: c.seo_title || `${c.name} — Digitech Learning Hub`,
    description: c.seo_description || c.bio || undefined,
    openGraph: c.og_image_url ? { images: [c.og_image_url] } : undefined,
  };
}

/** Resolve a creator intro video URL into an embeddable descriptor (or null). */
function resolveIntroVideo(url: string | null): IntroVideo | null {
  if (!url || !url.trim()) return null;
  const yt = youtubeIdFromUrl(url);
  if (yt) return { type: 'youtube', embedUrl: youtubeEmbedUrl(yt) };
  const vimeo = parseVimeoInput(url);
  if (vimeo) return { type: 'vimeo', id: vimeo.id };
  return { type: 'other', url };
}

export default async function CreatorPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);
  if (!creator) notFound();

  const [stats, guides, playlists] = await Promise.all([
    getCreatorStats(creator.id, true),
    listGuidesByCreator(creator.id, true),
    listPlaylistsByCreator(creator.id, true),
  ]);
  const playlistCounts = await getPlaylistItemCounts(playlists.map((p) => p.id));

  // Topics derived from the domains of the creator's guides + playlists.
  const topicMap = new Map<string, ProfileTopic>();
  for (const d of [...guides.map((g) => g.domain), ...playlists.map((p) => p.domain)]) {
    const meta = getDomainMeta(d);
    if (meta && !topicMap.has(meta.id)) topicMap.set(meta.id, { id: meta.id, label: meta.label });
  }
  const topics = Array.from(topicMap.values());

  const introVideo = resolveIntroVideo(creator.intro_video_url);

  return (
    <CreatorProfileView
      creator={creator}
      stats={stats}
      guides={guides}
      playlists={playlists}
      playlistCounts={playlistCounts}
      topics={topics}
      introVideo={introVideo}
    />
  );
}
