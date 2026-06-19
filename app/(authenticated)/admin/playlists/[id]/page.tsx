import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getPlaylistById, getPlaylistGuides, listGuidesByCreator } from '@/lib/learn/db';
import PlaylistEditor from '@/components/learn-admin/PlaylistEditor';

export const dynamic = 'force-dynamic';

export default async function AdminPlaylistEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playlist = await getPlaylistById(id);
  if (!playlist) notFound();

  const [items, creatorGuides] = await Promise.all([
    getPlaylistGuides(id),
    listGuidesByCreator(playlist.creator_id, false),
  ]);

  return (
    <div className="px-8 py-8 max-w-3xl">
      <Link href="/admin/playlists" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowRight className="w-3.5 h-3.5" />
        חזרה לפלייליסטים
      </Link>
      <PlaylistEditor
        initial={playlist}
        items={items}
        availableGuides={creatorGuides.map((g) => ({ id: g.id, title: g.title }))}
        backHref="/admin/playlists"
      />
    </div>
  );
}
