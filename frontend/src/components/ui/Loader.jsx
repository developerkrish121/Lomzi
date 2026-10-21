export function Loader({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center gap-5" role="status" aria-live="polite">
      <div className="relative size-14">
        <div className="absolute inset-0 rounded-full border-4 border-leaf/15" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-leaf" />
        <div className="absolute inset-4 rounded-full bg-sun" />
      </div>
      <p className="text-sm font-bold text-forest">{label}</p>
    </div>
  );
}
