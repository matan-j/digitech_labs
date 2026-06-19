import { Skeleton } from '@/components/learn/Skeleton';

export default function PlaylistLoading() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-5xl mx-auto">
      <Skeleton className="h-4 w-32 mb-6" />
      <Skeleton className="h-48 w-full rounded-card mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-card" />
        ))}
      </div>
    </div>
  );
}
