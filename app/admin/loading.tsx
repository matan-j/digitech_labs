export default function AdminLoading() {
  return (
    <div className="px-8 py-12 max-w-5xl">
      <div className="animate-pulse space-y-4">
        <div className="h-7 bg-neutral-200 rounded w-40" />
        <div className="h-4 bg-neutral-100 rounded w-80" />
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="h-32 bg-neutral-100 rounded-2xl" />
          <div className="h-32 bg-neutral-100 rounded-2xl" />
          <div className="h-32 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
