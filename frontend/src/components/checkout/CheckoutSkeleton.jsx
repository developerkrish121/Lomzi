export function CheckoutSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]" role="status">
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-40 rounded-[2rem] bg-white/70" />
        ))}
      </div>
      <div className="h-80 rounded-[2rem] bg-white/70" />
      <span className="sr-only">Loading checkout…</span>
    </div>
  );
}
