import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { requireCreator } from '@/lib/auth';
import { getPlaylistById, getPlaylistGuides, listGuidesByCreator } from '@/lib/learn/db';
import PlaylistEditor from '@/components/learn-admin/PlaylistEditor';
import CreatorDashboardNav from '@/components/creator/CreatorDashboardNav';

export const dynamic = 'force-dynamic';

export default async function CreatorPlaylistEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { creator } = await requireCreator(`/learn/creator/playlists/${id}`);
  const playlist = await getPlaylistById(id);
  if (!playlist || !creator || playlist.creator_id !== creator.id) notFound();

  const [items, myGuides] = await Promise.all([
    getPlaylistGuides(id),
    listGuidesByCreator(creator.id, false),
  ]);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-extrabold text-neutral-950 mb-6">לוח יוצר</h1>
      <CreatorDashboardNav />
      <Link href="/learn/creator/playlists" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowRight className="w-3.5 h-3.5" />
        חזרה לפלייליסטים שלי
      </Link>
      <PlaylistEditor
        initial={playlist}
        items={items}
        availableGuides={myGuides.map((g) => ({ id: g.id, title: g.title }))}
      />
    </div>
  );
}
