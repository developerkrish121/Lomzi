import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { EmptyProducts } from '@/components/discovery/EmptyProducts';
import { ProductCard } from '@/components/discovery/ProductCard';
import { ProductSkeleton } from '@/components/discovery/ProductSkeleton';
import { SearchBar } from '@/components/discovery/SearchBar';
import { Button } from '@/components/ui/Button';
import { useCategories, useProducts } from '@/features/discovery/hooks';

const sortOptions = [
  ['featured', 'Featured'],
  ['price-asc', 'Price: Low to high'],
  ['price-desc', 'Price: High to low'],
  ['name', 'Name'],
  ['newest', 'Newest'],
];

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = {
    page: Number(searchParams.get('page') || 1),
    limit: 12,
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'featured',
  };
  const categories = useCategories();
  const products = useProducts(params);

  const update = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    if (!Object.hasOwn(changes, 'page')) next.delete('page');
    setSearchParams(next, { replace: true });
  };
  const reset = () => setSearchParams({}, { replace: true });

  return (
    <section className="min-h-[70vh] bg-cream py-12 dark:bg-[#08150f] sm:py-16">
      <div className="page-container">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
        >
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf">
              Freshly curated
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-forest dark:text-white sm:text-5xl">
              Explore everyday essentials.
            </h1>
          </div>
          <SearchBar value={params.q} onSearch={(q) => update({ q })} />
        </motion.header>

        <div className="mt-10 flex gap-3 overflow-x-auto pb-3" aria-label="Filter by category">
          <button
            onClick={() => update({ category: '' })}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${!params.category ? 'bg-forest text-white' : 'border border-forest/10 bg-white text-forest hover:bg-mist'}`}
          >
            All products
          </button>
          {categories.data?.map((category) => (
            <button
              key={category.id}
              onClick={() => update({ category: category.slug })}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${params.category === category.slug ? 'bg-forest text-white' : 'border border-forest/10 bg-white text-forest hover:bg-mist'}`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-ink-muted dark:text-white/55">
            {products.data ? `${products.data.pagination.total} products` : 'Loading products…'}
          </p>
          <label className="flex items-center gap-2 rounded-2xl border border-forest/10 bg-white px-3 dark:border-white/10 dark:bg-white/10">
            <SlidersHorizontal className="size-4 text-ink-muted" />
            <span className="sr-only">Sort products</span>
            <select
              value={params.sort}
              onChange={(event) => update({ sort: event.target.value })}
              className="min-h-11 bg-transparent text-sm font-bold text-forest outline-none dark:text-white"
            >
              {sortOptions.map(([value, label]) => (
                <option key={value} value={value} className="text-ink">
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {products.isError && (
          <div role="alert" className="mt-8 rounded-card bg-red-50 p-8 text-center">
            <h2 className="font-display text-xl font-extrabold text-red-800">
              Products could not be loaded
            </h2>
            <p className="mt-2 text-red-700">{products.error.message}</p>
            <Button className="mt-5" onClick={() => products.refetch()}>
              Try again
            </Button>
          </div>
        )}
        {!products.isError && (
          <div className="mt-8 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.isPending ? (
              Array.from({ length: 8 }, (_, index) => <ProductSkeleton key={index} />)
            ) : products.data.products.length ? (
              products.data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <EmptyProducts onReset={reset} />
            )}
          </div>
        )}

        {products.data?.pagination.totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Product pages">
            <Button
              variant="secondary"
              disabled={params.page <= 1}
              onClick={() => update({ page: String(params.page - 1) })}
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <span className="px-2 text-sm font-bold text-forest dark:text-white">
              {params.page} of {products.data.pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={params.page >= products.data.pagination.totalPages}
              onClick={() => update({ page: String(params.page + 1) })}
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </nav>
        )}
      </div>
    </section>
  );
}
