import { Skeleton, CardGridSkeleton } from '@/components/learn/Skeleton';

export default function CreatorLoading() {
  return (
    <div>
      <Skeleton className="h-40 sm:h-56 w-full rounded-none" />
      <div className="px-4 sm:px-6 lg:px-10 max-w-5xl mx-auto">
        <div className="-mt-12 flex items-end gap-5">
          <Skeleton className="w-24 h-24 rounded-card border-4 border-white" />
          <Skeleton className="h-7 w-48 mb-2" />
        </div>
        <div className="py-8 space-y-8">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-16 w-full rounded-card" />
          <CardGridSkeleton count={3} />
        </div>
      </div>
    </div>
  );
}
