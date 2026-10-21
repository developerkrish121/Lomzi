export function ProductSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading product"
      className="overflow-hidden rounded-card border border-forest/6 bg-white shadow-soft"
    >
      <div className="skeleton-shimmer aspect-[4/3]" />
      <div className="space-y-3 p-5">
        <div className="skeleton-shimmer h-3 w-20 rounded" />
        <div className="skeleton-shimmer h-6 w-4/5 rounded" />
        <div className="skeleton-shimmer h-4 w-2/5 rounded" />
        <div className="skeleton-shimmer mt-5 h-8 rounded" />
      </div>
      <span className="sr-only">Loading product…</span>
    </div>
  );
}
