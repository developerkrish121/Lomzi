import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { CartItem } from '@/components/cart/CartItem';
import { CartSkeleton } from '@/components/cart/CartSkeleton';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';

export function CartPage() {
  const { cart, loading, error, refetch, clearCart, clearing, errorMessage } = useCart();
  const { notify } = useToast();
  const clear = async () => {
    try {
      await clearCart();
      notify('Your basket has been cleared.');
    } catch (requestError) {
      notify(errorMessage(requestError));
    }
  };

  return (
    <div className="min-h-[70vh] bg-[radial-gradient(circle_at_top_right,rgba(225,243,221,.9),transparent_35rem)] py-10 sm:py-16">
      <section className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf">
              Your selections
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-forest sm:text-5xl">
              Shopping cart
            </h1>
            {!loading && (
              <p className="mt-3 text-ink-muted">{cart.totalItems} items in your basket</p>
            )}
          </div>
          {!loading && cart.items.length > 0 && (
            <Button variant="secondary" onClick={clear} loading={clearing}>
              <Trash2 className="size-4" /> Clear cart
            </Button>
          )}
        </motion.div>

        <div className="mt-9">
          {loading ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <CartSkeleton />
              <div className="h-64 animate-pulse rounded-[2rem] bg-white/70" />
            </div>
          ) : error ? (
            <div className="rounded-[2rem] bg-white/70 p-10 text-center shadow-soft">
              <h2 className="font-display text-2xl font-extrabold text-forest">
                We couldn’t load your basket
              </h2>
              <p className="mt-2 text-ink-muted">Please check your connection and try again.</p>
              <Button className="mt-6" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : cart.items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <motion.div layout className="space-y-4">
                <AnimatePresence initial={false}>
                  {cart.items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </motion.div>
              <CartSummary subtotal={cart.subtotal} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
