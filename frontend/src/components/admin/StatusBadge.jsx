import { cn } from '@/utils/cn';
const colors = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PACKING: 'bg-violet-100 text-violet-800',
  OUT_FOR_DELIVERY: 'bg-cyan-100 text-cyan-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-700',
};
export function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold tracking-wide',
        colors[status] ?? 'bg-slate-100 text-slate-700',
      )}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}
