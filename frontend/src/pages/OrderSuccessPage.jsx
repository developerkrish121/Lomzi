import { motion } from 'framer-motion';
import { Check, Clock3, Copy } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { estimatedDelivery } from '@/features/checkout/constants';
import { useOrder } from '@/features/checkout/hooks';
import { useToast } from '@/hooks/useToast';

export function OrderSuccessPage() {
  const { id } = useParams();
  const location = useLocation();
  const query = useOrder(id);
  const order = location.state?.order ?? query.data;
  const { notify } = useToast();
  if (!order && query.isPending)
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <div className="size-12 animate-spin rounded-full border-4 border-leaf border-t-transparent" />
      </div>
    );
  if (!order)
    return (
      <section className="page-container py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold text-forest">Order unavailable</h1>
        <Button className="mt-6" onClick={() => query.refetch()}>
          Try again
        </Button>
      </section>
    );
  const copy = async () => {
    await navigator.clipboard.writeText(order.id);
    notify('Order ID copied.');
  };
  return (
    <section className="page-container grid min-h-[75vh] place-items-center py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl rounded-[2.5rem] border border-white/70 bg-white/70 p-7 text-center shadow-lift backdrop-blur-xl sm:p-12"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.15 }}
          className="mx-auto grid size-24 place-items-center rounded-full bg-leaf text-white shadow-button"
        >
          <Check className="size-12" />
        </motion.span>
        <p className="mt-8 text-sm font-extrabold uppercase tracking-[0.18em] text-leaf">
          Order confirmed
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-forest">
          Your basket is on its way.
        </h1>
        <p className="mt-4 text-ink-muted">Pay with cash when your delivery arrives.</p>
        <div className="mt-8 grid gap-3 rounded-3xl bg-mist p-5 text-left sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Order ID</p>
            <button
              type="button"
              onClick={copy}
              className="mt-2 flex max-w-full items-center gap-2 font-mono text-sm font-bold text-forest"
            >
              <span className="truncate">{order.id}</span>
              <Copy className="size-4 shrink-0" />
            </button>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Estimated delivery
            </p>
            <p className="mt-2 flex items-center gap-2 font-bold text-forest">
              <Clock3 className="size-4 text-leaf" /> {estimatedDelivery(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            to="/products"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-5 text-sm font-bold text-white"
          >
            Continue shopping
          </Link>
          <Link
            to={`/orders/${order.id}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-forest/12 bg-white px-5 text-sm font-bold text-forest"
          >
            View order details
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
