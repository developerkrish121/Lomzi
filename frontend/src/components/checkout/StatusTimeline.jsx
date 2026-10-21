import { Check } from 'lucide-react';
import { ACTIVE_TIMELINE, ORDER_STATUS } from '@/features/checkout/constants';

export function StatusTimeline({ status }) {
  if (status === 'CANCELLED')
    return (
      <div className="rounded-2xl bg-red-50 p-4 font-bold text-red-700">
        This order was cancelled.
      </div>
    );
  const active = ACTIVE_TIMELINE.indexOf(status);
  return (
    <ol className="grid gap-0 sm:grid-cols-5">
      {ACTIVE_TIMELINE.map((step, index) => (
        <li key={step} className="relative flex gap-3 pb-6 sm:block sm:pb-0 sm:text-center">
          <span
            className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full ${index <= active ? 'bg-leaf text-white' : 'bg-mist text-ink-muted'}`}
          >
            {index < active ? <Check className="size-4" /> : index + 1}
          </span>
          {index < ACTIVE_TIMELINE.length - 1 && (
            <span
              className={`absolute left-4 top-8 h-[calc(100%-2rem)] w-0.5 sm:left-1/2 sm:top-4 sm:h-0.5 sm:w-full ${index < active ? 'bg-leaf' : 'bg-forest/10'}`}
            />
          )}
          <span className="pt-1 text-xs font-bold text-forest sm:mt-3 sm:block">
            {ORDER_STATUS[step]}
          </span>
        </li>
      ))}
    </ol>
  );
}
