import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3">
      <p className="text-sm text-slate-500">
        Page {pagination.page} of {pagination.totalPages}
      </p>
      <div className="flex gap-2">
        <button
          aria-label="Previous page"
          disabled={pagination.page <= 1}
          onClick={() => onPage(pagination.page - 1)}
          className="grid size-11 place-items-center rounded-xl bg-white ring-1 ring-slate-200 disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          aria-label="Next page"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPage(pagination.page + 1)}
          className="grid size-11 place-items-center rounded-xl bg-white ring-1 ring-slate-200 disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
