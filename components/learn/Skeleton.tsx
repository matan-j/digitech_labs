/** Purple-tinted shimmer block. Composable building piece for loading states. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={['animate-pulse rounded-md', className].join(' ')}
      style={{ backgroundColor: 'var(--color-brand-purple-100)' }}
    />
  );
}

/** A card-shaped skeleton mirroring LearnCard / CreatorCard. */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-card border border-neutral-200 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/** A responsive grid of card skeletons. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
