import { requireCreator } from '@/lib/auth';
import { getCreatorById } from '@/lib/learn/db';
import CreatorDashboardNav from '@/components/creator/CreatorDashboardNav';
import CreatorProfileForm from '@/components/creator/CreatorProfileForm';
import EmptyState from '@/components/learn/EmptyState';
import { User } from 'lucide-react';

export const metadata = { title: 'הפרופיל שלי · לוח יוצר' };
export const dynamic = 'force-dynamic';

export default async function CreatorProfilePage() {
  const { creator } = await requireCreator('/learn/creator/profile');
  const full = creator ? await getCreatorById(creator.id) : null;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 mb-6">לוח יוצר</h1>
      <CreatorDashboardNav />
      {full ? (
        <CreatorProfileForm initial={full} />
      ) : (
        <EmptyState icon={User} title="אינך משויך ליוצר" message="פנה למנהל המערכת לשיוך פרופיל יוצר." />
      )}
    </div>
  );
}
