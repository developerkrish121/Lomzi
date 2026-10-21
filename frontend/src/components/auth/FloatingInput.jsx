import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export const FloatingInput = forwardRef(function FloatingInput(
  { id, label, error, className, ...props },
  ref,
) {
  return (
    <motion.div className="grid gap-2" whileFocusWithin={{ y: -1 }} transition={{ duration: 0.18 }}>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          placeholder=" "
          className={cn(
            'peer min-h-14 w-full rounded-2xl border border-forest/12 bg-white/75 px-4 pb-2 pt-6 text-ink outline-none backdrop-blur transition duration-200 focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/10 dark:border-white/15 dark:bg-white/8 dark:text-white dark:focus:bg-white/12',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-2 text-xs font-bold text-ink-muted transition-all duration-200 peer-placeholder-shown:top-4.5 peer-placeholder-shown:text-base peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:font-bold peer-focus:text-leaf dark:text-white/60 dark:peer-focus:text-mint"
        >
          {label}
        </label>
      </div>
      {error && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${id}-error`}
          role="alert"
          className="px-1 text-sm font-medium text-red-600 dark:text-red-300"
        >
          {error}
        </motion.span>
      )}
    </motion.div>
  );
});
