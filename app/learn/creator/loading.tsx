import { Skeleton } from '@/components/learn/Skeleton';

export default function CreatorDashboardLoading() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-5xl mx-auto">
      <Skeleton className="h-8 w-40 mb-3" />
      <Skeleton className="h-4 w-64 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-card" />
    </div>
  );
}
