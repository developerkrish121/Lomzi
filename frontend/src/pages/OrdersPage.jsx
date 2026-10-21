import { motion } from 'framer-motion';
import { ArrowRight, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CheckoutSkeleton } from '@/components/checkout/CheckoutSkeleton';
import { Button } from '@/components/ui/Button';
import { ORDER_STATUS } from '@/features/checkout/constants';
import { useOrders } from '@/features/checkout/hooks';
import { formatPrice } from '@/features/discovery/format';

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );

export function OrdersPage() {
  const query = useOrders();
  if (query.isPending)
    return (
      <section className="page-container py-16">
        <CheckoutSkeleton />
      </section>
    );
  if (query.isError)
    return (
      <section className="page-container py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold text-forest">
          Orders could not be loaded
        </h1>
        <Button className="mt-6" onClick={() => query.refetch()}>
          Try again
        </Button>
      </section>
    );
  return (
    <section className="page-container py-12 sm:py-20">
      <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf">Order history</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold text-forest sm:text-5xl">
        My orders
      </h1>
      {query.data.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-[2rem] bg-white/70 px-6 py-16 text-center shadow-soft">
          <PackageOpen className="size-12 text-leaf" />
          <h2 className="mt-5 font-display text-2xl font-extrabold text-forest">No orders yet</h2>
          <Link
            to="/products"
            className="mt-6 rounded-full bg-forest px-6 py-3 text-sm font-bold text-white"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {query.data.map((order, index) => (
            <motion.article
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-lg font-extrabold text-forest">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-extrabold ${order.status === 'CANCELLED' ? 'bg-red-50 text-red-700' : order.status === 'DELIVERED' ? 'bg-mint text-forest' : 'bg-sun/30 text-forest'}`}
                    >
                      {ORDER_STATUS[order.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">
                    {formatDate(order.createdAt)} · {order.items.length} products
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Total</p>
                  <strong className="mt-1 block text-xl text-forest">
                    {formatPrice(order.totalAmount)}
                  </strong>
                </div>
              </div>
              <Link
                to={`/orders/${order.id}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full text-sm font-bold text-forest hover:text-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
              >
                View details <ArrowRight className="size-4" />
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
