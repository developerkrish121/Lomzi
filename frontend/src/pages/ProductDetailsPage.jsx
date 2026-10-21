import { ArrowLeft, CheckCircle2, PackageCheck, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '@/components/discovery/ProductCard';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { formatPrice } from '@/features/discovery/format';
import { useProduct } from '@/features/discovery/hooks';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ProductImage } from '@/components/discovery/ProductImage';

export function ProductDetailsPage() {
  const { id } = useParams();
  const query = useProduct(id);

  if (query.isPending)
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <Loader label="Loading product details…" />
      </div>
    );
  if (query.isError)
    return (
      <section className="page-container grid min-h-[65vh] place-items-center py-16 text-center">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-forest">Product unavailable</h1>
          <p className="mt-3 text-ink-muted">We could not load this product.</p>
          <Button className="mt-6" onClick={() => query.refetch()}>
            Try again
          </Button>
        </div>
      </section>
    );

  const { product, relatedProducts } = query.data;
  const discounted = product.discountPrice && Number(product.discountPrice) < Number(product.price);
  return (
    <div className="bg-cream dark:bg-[#08150f]">
      <section className="page-container py-10 sm:py-16">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-forest transition hover:bg-forest/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf dark:text-white"
        >
          <ArrowLeft className="size-4" /> Back to products
        </Link>
        <div className="mt-7 grid gap-10 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden rounded-[2.5rem] bg-white shadow-soft"
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              decoding="async"
              className="aspect-square size-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
          >
            <Link
              to={`/products?category=${product.category.slug}`}
              className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf hover:underline"
            >
              {product.category.name}
            </Link>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-forest dark:text-white sm:text-6xl">
              {product.name}
            </h1>
            <p className="mt-6 text-lg leading-8 text-ink-muted dark:text-white/60">
              {product.description}
            </p>
            <div className="mt-8 flex flex-wrap items-end gap-3">
              <strong className="font-display text-4xl font-extrabold text-forest dark:text-white">
                {formatPrice(product.discountPrice ?? product.price)}
              </strong>
              {discounted && (
                <span className="pb-1 text-lg text-ink-muted line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-white/8">
                <PackageCheck className="size-5 text-leaf" />
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Unit
                </p>
                <p className="font-extrabold text-forest dark:text-white">{product.unit}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-white/8">
                <CheckCircle2 className="size-5 text-leaf" />
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Availability
                </p>
                <p className="font-extrabold text-forest dark:text-white">
                  {product.isAvailable && product.stock > 0 ? 'In stock' : 'Unavailable'}
                </p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-white/8">
                <Tag className="size-5 text-leaf" />
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Category
                </p>
                <p className="font-extrabold text-forest dark:text-white">
                  {product.category.name}
                </p>
              </div>
            </div>
            <AddToCartButton product={product} className="mt-6 min-w-48" />
          </motion.div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="border-t border-forest/8 bg-white py-16 dark:border-white/10 dark:bg-white/5 sm:py-20">
          <div className="page-container">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf">
              You may also like
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-forest dark:text-white">
              Related products
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
