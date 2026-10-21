import { ArrowLeft, HandCoins, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { CheckoutSkeleton } from '@/components/checkout/CheckoutSkeleton';
import { StatusTimeline } from '@/components/checkout/StatusTimeline';
import { ProductImage } from '@/components/discovery/ProductImage';
import { Button } from '@/components/ui/Button';
import { ORDER_STATUS, estimatedDelivery } from '@/features/checkout/constants';
import { useOrder } from '@/features/checkout/hooks';
import { formatPrice } from '@/features/discovery/format';

export function OrderDetailsPage() {
  const { id } = useParams();
  const query = useOrder(id);
  if (query.isPending)
    return (
      <section className="page-container py-16">
        <CheckoutSkeleton />
      </section>
    );
  if (query.isError)
    return (
      <section className="page-container py-20 text-center">
        <h1 className="font-display text-3xl font-extrabold text-forest">Order unavailable</h1>
        <p className="mt-2 text-ink-muted">
          This order does not exist or is not available to your account.
        </p>
        <Button className="mt-6" onClick={() => query.refetch()}>
          Try again
        </Button>
      </section>
    );
  const order = query.data;
  const address = order.address;
  return (
    <section className="page-container py-10 sm:py-16">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-forest hover:bg-forest/6"
      >
        <ArrowLeft className="size-4" /> My orders
      </Link>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf">
            {ORDER_STATUS[order.status]}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-forest sm:text-5xl">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            Placed{' '}
            {new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeStyle: 'short' }).format(
              new Date(order.createdAt),
            )}
          </p>
        </div>
        {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
          <div className="rounded-2xl bg-mint px-4 py-3 text-sm font-bold text-forest">
            Estimated {estimatedDelivery(order.createdAt)}
          </div>
        )}
      </div>
      <div className="mt-9 rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl sm:p-8">
        <h2 className="font-display text-xl font-extrabold text-forest">Order status</h2>
        <div className="mt-7">
          <StatusTimeline status={order.status} />
        </div>
      </div>
      <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-forest">Products</h2>
          <div className="mt-5 divide-y divide-forest/8">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4">
                <ProductImage
                  src={item.product.image}
                  alt={item.product.name}
                  className="size-16 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-forest">{item.product.name}</h3>
                  <p className="text-sm text-ink-muted">
                    {item.product.unit} · Qty {item.quantity}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">{formatPrice(item.price)} each</p>
                </div>
                <strong className="text-sm text-forest">
                  {formatPrice(Number(item.price) * item.quantity)}
                </strong>
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-forest">
              <MapPin className="size-5 text-leaf" /> Delivery address
            </h2>
            <p className="mt-4 text-sm font-bold text-forest">{address.fullName}</p>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ''}
              <br />
              {address.city}, {address.state} {address.postalCode}
              <br />
              {address.country}
              <br />
              {address.phone}
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-forest">
              <HandCoins className="size-5 text-leaf" /> Cash on Delivery
            </h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-ink-muted">
                <dt>Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt>Delivery</dt>
                <dd>{formatPrice(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-forest/10 pt-3 font-extrabold text-forest">
                <dt>Total</dt>
                <dd>{formatPrice(order.totalAmount)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}
