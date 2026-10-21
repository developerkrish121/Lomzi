import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Input = forwardRef(function Input({ className, label, id, error, ...props }, ref) {
  return (
    <label className="grid min-w-0 gap-2" htmlFor={id}>
      {label && <span className="text-sm font-bold text-forest">{label}</span>}
      <input
        ref={ref}
        id={id}
        className={cn(
          'min-h-12 min-w-0 w-full rounded-2xl border border-forest/12 bg-white px-4 text-ink outline-none transition placeholder:text-ink-muted/65 focus:border-leaf focus:ring-4 focus:ring-leaf/10',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </span>
      )}
    </label>
  );
});
