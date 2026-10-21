import { useEffect, useRef, useState } from 'react';
import { Clock3, HandCoins, PackageCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AddressBook } from '@/components/checkout/AddressBook';
import { CheckoutSkeleton } from '@/components/checkout/CheckoutSkeleton';
import { Button } from '@/components/ui/Button';
import { DELIVERY_FEE, estimatedDelivery } from '@/features/checkout/constants';
import { checkoutError, useAddresses, usePlaceOrder } from '@/features/checkout/hooks';
import { ProductImage } from '@/components/discovery/ProductImage';
import { formatPrice } from '@/features/discovery/format';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';

export function CheckoutPage() {
  const { cart, loading: cartLoading } = useCart();
  const addresses = useAddresses();
  const placeOrder = usePlaceOrder();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [addressId, setAddressId] = useState(null);
  const placingRef = useRef(false);
  const idempotencyKeyRef = useRef(crypto.randomUUID());
  useEffect(() => {
    if (!addressId && addresses.data?.length)
      setAddressId((addresses.data.find((item) => item.isDefault) ?? addresses.data[0]).id);
  }, [addressId, addresses.data]);
  const place = async () => {
    if (placingRef.current) return;
    if (!addressId) return notify('Select or add a delivery address.');
    placingRef.current = true;
    try {
      const order = await placeOrder.mutateAsync({
        addressId,
        idempotencyKey: idempotencyKeyRef.current,
      });
      notify('Order placed successfully.');
      navigate(`/orders/${order.id}/success`, { replace: true, state: { order } });
    } catch (error) {
      placingRef.current = false;
      notify(checkoutError(error));
    }
  };
  if (cartLoading || addresses.isPending)
    return (
      <section className="page-container py-12 sm:py-20">
        <CheckoutSkeleton />
      </section>
    );
  if (!cart.items.length)
    return (
      <section className="page-container grid min-h-[65vh] place-items-center py-16 text-center">
        <div>
          <PackageCheck className="mx-auto size-12 text-leaf" />
          <h1 className="mt-5 font-display text-3xl font-extrabold text-forest">
            Your cart is empty
          </h1>
          <p className="mt-2 text-ink-muted">Add products before starting checkout.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-bold text-white"
          >
            Browse products
          </Link>
        </div>
      </section>
    );
  const total = Number(cart.subtotal) + DELIVERY_FEE;
  return (
    <section className="page-container py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf">
          Secure checkout
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-forest sm:text-5xl">
          Review and place order
        </h1>
      </motion.div>
      <div className="mt-9 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-7">
          <div className="rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-soft backdrop-blur-xl sm:p-7">
            <AddressBook
              selectedId={addressId}
              onSelect={(nextAddressId) => {
                setAddressId(nextAddressId);
                idempotencyKeyRef.current = crypto.randomUUID();
              }}
              compact
            />
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-soft backdrop-blur-xl sm:p-7">
            <h2 className="font-display text-2xl font-extrabold text-forest">Order summary</h2>
            <div className="mt-5 divide-y divide-forest/8">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <ProductImage
                    src={item.product.image}
                    alt=""
                    className="size-16 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-forest">{item.product.name}</h3>
                    <p className="text-sm text-ink-muted">
                      {item.product.unit} · Qty {item.quantity}
                    </p>
                  </div>
                  <strong className="text-sm text-forest">{formatPrice(item.lineTotal)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur-xl lg:sticky lg:top-28">
          <h2 className="font-display text-xl font-extrabold text-forest">Payment summary</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between text-ink-muted">
              <dt>Subtotal</dt>
              <dd className="font-bold text-forest">{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-ink-muted">
              <dt>Delivery</dt>
              <dd className="font-bold text-forest">{formatPrice(DELIVERY_FEE)}</dd>
            </div>
            <div className="flex justify-between border-t border-forest/10 pt-4 font-display text-lg font-extrabold text-forest">
              <dt>Grand total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          <div className="mt-6 space-y-3 rounded-2xl bg-mist p-4 text-sm">
            <p className="flex items-center gap-2 font-bold text-forest">
              <Clock3 className="size-4 text-leaf" /> Estimated {estimatedDelivery()}
            </p>
            <p className="flex items-center gap-2 font-bold text-forest">
              <HandCoins className="size-4 text-leaf" /> Cash on Delivery
            </p>
          </div>
          <Button
            className="mt-6 w-full"
            onClick={place}
            loading={placeOrder.isPending}
            disabled={!addressId}
          >
            Place order
          </Button>
          <p className="mt-3 text-center text-xs leading-5 text-ink-muted">
            Payment is collected in cash when your order arrives.
          </p>
        </aside>
      </div>
    </section>
  );
}
