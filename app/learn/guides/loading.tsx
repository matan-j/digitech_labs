import { Skeleton, CardGridSkeleton } from '@/components/learn/Skeleton';

export default function GuidesLoading() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-6xl mx-auto">
      <Skeleton className="h-8 w-40 mb-3" />
      <Skeleton className="h-4 w-72 mb-8" />
      <Skeleton className="h-10 w-full max-w-xl mb-8 rounded-input" />
      <CardGridSkeleton count={6} />
    </div>
  );
}
