import {
  Apple,
  Carrot,
  Cookie,
  Croissant,
  CupSoda,
  Milk,
  Shapes,
  Snowflake,
  Wheat,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const icons = { Apple, Carrot, Cookie, Croissant, CupSoda, Milk, Snowflake, Wheat };
const isEmoji = (value) => value && /[^\p{L}\p{N}\s_-]/u.test(value);

export function CategoryIcon({ icon, className }) {
  const Icon = icons[icon];

  if (Icon) return <Icon aria-hidden="true" className={cn('size-7', className)} />;

  if (isEmoji(icon)) {
    return (
      <span
        role="img"
        aria-label="Category icon"
        className={cn('text-2xl leading-none', className)}
      >
        {icon}
      </span>
    );
  }

  return <Shapes aria-hidden="true" className={cn('size-7', className)} />;
}
