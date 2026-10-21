import { cn } from '@/utils/cn';

export function Card({ as: Component = 'div', className, children, ...props }) {
  return (
    <Component
      className={cn('rounded-card border border-forest/8 bg-white shadow-soft', className)}
      {...props}
    >
      {children}
    </Component>
  );
}
