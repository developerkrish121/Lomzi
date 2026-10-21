import { AlertTriangle, Inbox } from 'lucide-react';

export function AdminSkeleton({ rows = 4 }) {
  return (
    <div role="status" aria-label="Loading content" className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-shimmer h-20 rounded-2xl" />
      ))}
      <span className="sr-only">Loading content…</span>
    </div>
  );
}
export function AdminError({ message, retry }) {
  return (
    <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
      <AlertTriangle className="mx-auto mb-3 size-8 text-red-500" />
      <h2 className="font-bold text-red-900">Something went wrong</h2>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 rounded-full bg-red-700 px-5 py-2 text-sm font-bold text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
}
export function AdminEmpty({ title = 'Nothing here yet', message }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
      <Inbox className="mx-auto mb-3 size-9 text-slate-400" />
      <h2 className="font-bold text-slate-800">{title}</h2>
      {message && <p className="mt-1 text-sm text-slate-500">{message}</p>}
    </div>
  );
}
