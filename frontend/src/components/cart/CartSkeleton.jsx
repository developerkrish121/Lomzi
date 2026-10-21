export function CartSkeleton({ compact = false }) {
  return (
    <div className="space-y-4" aria-label="Loading cart" role="status">
      {Array.from({ length: compact ? 3 : 4 }, (_, index) => (
        <div key={index} className="flex animate-pulse gap-4 rounded-3xl bg-white/70 p-4">
          <div className="size-20 shrink-0 rounded-2xl bg-forest/8" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 w-2/3 rounded bg-forest/8" />
            <div className="h-3 w-1/3 rounded bg-forest/8" />
            <div className="h-8 w-28 rounded-full bg-forest/8" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading your cart…</span>
    </div>
  );
}
