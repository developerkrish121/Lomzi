import { ShoppingBasket } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyCart({ onContinue }) {
  return (
    <div className="grid place-items-center rounded-[2rem] border border-white/70 bg-white/65 px-6 py-14 text-center shadow-soft backdrop-blur-xl">
      <span className="grid size-20 place-items-center rounded-full bg-mint text-forest">
        <ShoppingBasket className="size-9" />
      </span>
      <h2 className="mt-6 font-display text-2xl font-extrabold text-forest">
        Your basket is empty
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">
        Discover fresh everyday essentials and add what you need.
      </p>
      <Link
        to="/products"
        onClick={onContinue}
        className="mt-7 rounded-full bg-forest px-6 py-3 text-sm font-bold text-white shadow-button transition hover:bg-forest-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf focus-visible:ring-offset-2"
      >
        Browse products
      </Link>
    </div>
  );
}
