import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { requireCreator } from '@/lib/auth';
import NewPlaylistForm from './NewPlaylistForm';

export const metadata = { title: 'פלייליסט חדש · לוח יוצר' };
export const dynamic = 'force-dynamic';

export default async function NewCreatorPlaylistPage() {
  await requireCreator('/learn/creator/playlists/new');
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-2xl mx-auto">
      <Link href="/learn/creator/playlists" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowRight className="w-3.5 h-3.5" />
        חזרה לפלייליסטים שלי
      </Link>
      <h1 className="text-2xl font-extrabold text-neutral-950 mb-6">פלייליסט חדש</h1>
      <NewPlaylistForm />
    </div>
  );
}
