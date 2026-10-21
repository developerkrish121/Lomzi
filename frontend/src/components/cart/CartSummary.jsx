import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/features/discovery/format';
import { DELIVERY_FEE } from '@/features/checkout/constants';

export function CartSummary({ subtotal, onContinue }) {
  return (
    <aside className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl lg:sticky lg:top-28">
      <h2 className="font-display text-xl font-extrabold text-forest">Basket summary</h2>
      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between gap-4 text-ink-muted">
          <dt>Subtotal</dt>
          <dd className="font-bold text-forest">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-ink-muted">
          <dt>Delivery fee</dt>
          <dd className="font-bold text-forest">{formatPrice(DELIVERY_FEE)}</dd>
        </div>
        <div className="border-t border-forest/10 pt-4">
          <div className="flex justify-between gap-4 font-display text-lg font-extrabold text-forest">
            <dt>Grand total</dt>
            <dd>{formatPrice(Number(subtotal) + DELIVERY_FEE)}</dd>
          </div>
          <p className="mt-2 text-xs leading-5 text-ink-muted">Cash on Delivery</p>
        </div>
      </dl>
      <Link
        to="/products"
        onClick={onContinue}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-forest/12 bg-white px-5 text-sm font-bold text-forest transition hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
      >
        <ArrowLeft className="size-4" /> Continue shopping
      </Link>
      <Link
        to="/checkout"
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest px-5 text-sm font-bold text-white shadow-button transition hover:bg-forest-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
      >
        Proceed to checkout <ArrowRight className="size-4" />
      </Link>
    </aside>
  );
}
