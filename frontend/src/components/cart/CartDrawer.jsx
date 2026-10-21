import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingBasket, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartItem } from '@/components/cart/CartItem';
import { CartSkeleton } from '@/components/cart/CartSkeleton';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { formatPrice } from '@/features/discovery/format';
import { useCart } from '@/hooks/useCart';

export function CartDrawer() {
  const { cart, loading, drawerOpen, closeDrawer } = useCart();

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && closeDrawer();
    document.addEventListener('keydown', closeOnEscape);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [closeDrawer, drawerOpen]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
        >
          <motion.button
            type="button"
            aria-label="Close cart"
            className="absolute inset-0 size-full bg-forest/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/30 bg-cream/95 shadow-2xl backdrop-blur-2xl"
          >
            <header className="flex items-center justify-between border-b border-forest/8 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-forest text-sun">
                  <ShoppingBasket className="size-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-forest">Your basket</h2>
                  <p className="text-xs text-ink-muted">{cart.totalItems} items</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="grid size-11 place-items-center rounded-full text-forest hover:bg-forest/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
                aria-label="Close cart"
              >
                <X className="size-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loading ? (
                <CartSkeleton compact />
              ) : cart.items.length ? (
                <motion.div layout className="space-y-3">
                  <AnimatePresence initial={false}>
                    {cart.items.map((item) => (
                      <CartItem key={item.id} item={item} compact />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <EmptyCart onContinue={closeDrawer} />
              )}
            </div>
            {!loading && cart.items.length > 0 && (
              <footer className="border-t border-forest/8 bg-white/70 p-5 backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between font-display text-lg font-extrabold text-forest">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <Link
                  to="/cart"
                  onClick={closeDrawer}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest px-5 text-sm font-bold text-white shadow-button transition hover:bg-forest-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf focus-visible:ring-offset-2"
                >
                  View full cart <ArrowRight className="size-4" />
                </Link>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
