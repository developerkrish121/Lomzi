import { LoaderCircle, Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/features/discovery/format';
import { ProductImage } from '@/components/discovery/ProductImage';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';

export function CartItem({ item, compact = false }) {
  const { updateItem, removeItem, pendingItemId, errorMessage } = useCart();
  const { notify } = useToast();
  const pending = pendingItemId === item.id;

  const run = async (action, successMessage) => {
    try {
      await action();
      if (successMessage) notify(successMessage);
    } catch (error) {
      notify(errorMessage(error));
    }
  };

  return (
    <motion.article
      layout
      exit={{ opacity: 0, x: 20 }}
      className="flex gap-3 rounded-3xl border border-forest/8 bg-white/80 p-3 shadow-sm backdrop-blur sm:gap-5 sm:p-4"
    >
      <ProductImage
        src={item.product.image}
        alt={item.product.name}
        className={`${compact ? 'size-20' : 'size-24 sm:size-28'} shrink-0 rounded-2xl object-cover`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display font-extrabold text-forest">
              {item.product.name}
            </h3>
            <p className="mt-1 text-xs text-ink-muted">{item.product.unit}</p>
          </div>
          <strong className="shrink-0 text-sm text-forest">{formatPrice(item.lineTotal)}</strong>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center rounded-full border border-forest/10 bg-mist p-1">
            <button
              type="button"
              onClick={() => run(() => updateItem(item.id, item.quantity - 1))}
              disabled={pending}
              className="grid size-11 place-items-center rounded-full text-forest transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf disabled:opacity-50"
              aria-label={`Decrease ${item.product.name} quantity`}
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-8 text-center text-sm font-extrabold" aria-live="polite">
              {pending ? <LoaderCircle className="mx-auto size-4 animate-spin" /> : item.quantity}
            </span>
            <button
              type="button"
              onClick={() => run(() => updateItem(item.id, item.quantity + 1))}
              disabled={pending || item.quantity >= item.product.stock}
              className="grid size-11 place-items-center rounded-full text-forest transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf disabled:opacity-40"
              aria-label={`Increase ${item.product.name} quantity`}
            >
              <Plus className="size-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => run(() => removeItem(item.id), `${item.product.name} removed.`)}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
          >
            <Trash2 className="size-4" />{' '}
            <span className={compact ? 'sr-only sm:not-sr-only' : ''}>Remove</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
