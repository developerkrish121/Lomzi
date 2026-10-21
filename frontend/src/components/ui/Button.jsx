import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

const variants = {
  primary: 'bg-forest text-white shadow-button hover:bg-forest-light focus-visible:ring-leaf',
  secondary: 'bg-white text-forest ring-1 ring-inset ring-forest/12 hover:bg-mist',
  ghost: 'bg-transparent text-forest hover:bg-forest/6',
};

export function Button({ children, className, variant = 'primary', loading = false, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
