import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function EmptyProducts({ onReset }) {
  return (
    <div className="col-span-full rounded-card border border-dashed border-forest/15 bg-white/60 px-6 py-16 text-center dark:border-white/15 dark:bg-white/5">
      <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-mint text-forest">
        <SearchX className="size-7" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-extrabold text-forest dark:text-white">
        No products found
      </h2>
      <p className="mx-auto mt-2 max-w-md text-ink-muted dark:text-white/55">
        Try a broader search or clear the selected category and sorting filters.
      </p>
      <Button variant="secondary" className="mt-6" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
}
