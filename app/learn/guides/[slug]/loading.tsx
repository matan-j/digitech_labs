import { Skeleton } from '@/components/learn/Skeleton';

export default function GuideDetailLoading() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-3xl mx-auto">
      <Skeleton className="h-4 w-32 mb-6" />
      <Skeleton className="aspect-video w-full rounded-2xl mb-6" />
      <Skeleton className="h-8 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-8" />
      <Skeleton className="h-16 w-full rounded-card" />
    </div>
  );
}
