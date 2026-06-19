import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { listCreators } from '@/lib/learn/db';
import NewPlaylistForm from './NewPlaylistForm';

export const metadata = { title: 'פלייליסט חדש — Digitech Learning Hub' };
export const dynamic = 'force-dynamic';

export default async function NewAdminPlaylistPage() {
  const creators = await listCreators();
  return (
    <div className="px-8 py-8 max-w-2xl">
      <Link href="/admin/playlists" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowRight className="w-3.5 h-3.5" />
        חזרה לפלייליסטים
      </Link>
      <h1 className="text-2xl font-extrabold text-neutral-950 mb-6">פלייליסט חדש</h1>
      <NewPlaylistForm creators={creators.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
