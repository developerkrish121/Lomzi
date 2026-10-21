import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

export const PasswordInput = forwardRef(function PasswordInput(
  { id, label, error, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  return (
    <motion.div className="grid gap-2" whileFocusWithin={{ y: -1 }} transition={{ duration: 0.18 }}>
      <div
        className={cn(
          'relative flex min-h-14 items-center rounded-2xl border border-forest/12 bg-white/75 pr-2 backdrop-blur transition duration-200 focus-within:border-leaf focus-within:bg-white focus-within:ring-4 focus-within:ring-leaf/10 dark:border-white/15 dark:bg-white/8 dark:focus-within:bg-white/12',
          error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/10',
        )}
      >
        <input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder=" "
          className="peer min-w-0 flex-1 bg-transparent px-4 pb-2 pt-6 text-ink outline-none dark:text-white"
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
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="grid size-11 shrink-0 place-items-center rounded-xl text-ink-muted transition hover:bg-mist hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
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
