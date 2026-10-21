import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/features/discovery/format';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ProductImage } from '@/components/discovery/ProductImage';

export function ProductCard({ product }) {
  const discounted = product.discountPrice && Number(product.discountPrice) < Number(product.price);
  return (
    <motion.article
      className="group flex h-full flex-col overflow-hidden rounded-card border border-forest/8 bg-white shadow-soft dark:border-white/10 dark:bg-white/8"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        to={`/products/${product.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-leaf"
        aria-label={`View ${product.name}`}
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-extrabold ${product.isAvailable && product.stock > 0 ? 'bg-white/90 text-forest' : 'bg-red-600 text-white'} backdrop-blur`}
        >
          {product.isAvailable && product.stock > 0 ? 'In stock' : 'Unavailable'}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-leaf">
          {product.category.name}
        </p>
        <h3 className="mt-2 font-display text-lg font-extrabold leading-snug text-forest dark:text-white">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-ink-muted dark:text-white/55">{product.unit}</p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            <strong className="text-lg text-forest dark:text-white">
              {formatPrice(product.discountPrice ?? product.price)}
            </strong>
            {discounted && (
              <span className="ml-2 text-sm text-ink-muted line-through dark:text-white/45">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <Link
            to={`/products/${product.id}`}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-forest text-white transition hover:bg-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf focus-visible:ring-offset-2"
            aria-label={`View details for ${product.name}`}
          >
            <ArrowUpRight className="size-5" />
          </Link>
        </div>
        <AddToCartButton product={product} compact className="mt-4 w-full" />
      </div>
    </motion.article>
  );
}
