import { motion } from 'framer-motion';
import { Clock3, Leaf, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CategoryCard } from '@/components/discovery/CategoryCard';
import { ProductCard } from '@/components/discovery/ProductCard';
import { ProductSkeleton } from '@/components/discovery/ProductSkeleton';
import { SearchBar } from '@/components/discovery/SearchBar';
import { Card } from '@/components/ui/Card';
import { useCategories, useProducts } from '@/features/discovery/hooks';

const reasons = [
  {
    icon: Clock3,
    title: 'Easy discovery',
    copy: 'Find everyday essentials quickly with useful search and focused categories.',
  },
  {
    icon: ShieldCheck,
    title: 'Clear choices',
    copy: 'Straightforward availability, units and pricing on every product.',
  },
  {
    icon: Sparkles,
    title: 'Curated quality',
    copy: 'A thoughtful range that keeps grocery shopping calm and uncomplicated.',
  },
];

function ProductSection({ eyebrow, title, products, loading }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="page-container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf">
              {eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-forest dark:text-white sm:text-4xl">
              {title}
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-bold text-forest transition hover:bg-forest/6 dark:text-white"
          >
            View all products →
          </Link>
        </div>
        <div className="mt-9 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} />)
            : products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const categories = useCategories();
  const products = useProducts({ page: 1, limit: 8, sort: 'featured', available: 'true' });
  const items = products.data?.products ?? [];

  return (
    <div className="dark:bg-[#08150f]">
      <section className="relative overflow-hidden bg-cream dark:bg-[#08150f]">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="page-container relative grid min-h-[620px] items-center gap-12 py-12 sm:min-h-[680px] sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-leaf/20 bg-white/70 px-4 py-2 text-sm font-bold text-forest shadow-sm backdrop-blur">
              <Leaf className="size-4 text-leaf" /> Everyday essentials, thoughtfully selected
            </div>
            <h1 className="max-w-3xl font-display text-[clamp(2.55rem,12vw,4.5rem)] font-extrabold leading-[1.04] tracking-[-0.045em] text-forest dark:text-white">
              Everyday finds, <span className="text-leaf">made simple.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-ink-muted dark:text-white/60">
              Explore fresh produce, pantry essentials and everyday favourites through one
              beautifully simple experience.
            </p>
            <div className="mt-9 max-w-2xl">
              <SearchBar
                onSearch={(q) => navigate(`/products${q ? `?q=${encodeURIComponent(q)}` : ''}`)}
                placeholder="Search milk, fruit, coffee and more…"
              />
            </div>
          </motion.div>
          <motion.div
            className="relative mx-auto w-full max-w-lg"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.6 }}
          >
            <div className="absolute -inset-6 rotate-3 rounded-[3rem] bg-sun/55" />
            <div className="relative overflow-hidden rounded-[2.5rem] bg-forest p-8 text-white shadow-2xl sm:p-10">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em]">
                  Selected for everyday life
                </span>
                <Leaf className="text-sun" />
              </div>
              <p className="mt-14 font-display text-3xl font-extrabold leading-tight sm:mt-20 sm:text-4xl">
                40 everyday essentials. Eight thoughtful aisles.
              </p>
              <p className="mt-5 leading-7 text-white/65">
                Browse real products with live search, clear pricing and availability.
              </p>
              <Link
                to="/products"
                className="mt-8 inline-flex min-h-12 items-center rounded-full bg-sun px-6 text-sm font-extrabold text-forest transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Browse products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-forest/8 bg-white py-16 dark:border-white/10 dark:bg-white/5 sm:py-20">
        <div className="page-container">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf">
            Shop by category
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-forest dark:text-white sm:text-4xl">
            Everything in its place.
          </h2>
          {categories.isError ? (
            <p role="alert" className="mt-8 rounded-2xl bg-red-50 p-5 text-red-700">
              Categories could not be loaded.{' '}
              <button onClick={() => categories.refetch()} className="font-bold underline">
                Try again
              </button>
            </p>
          ) : (
            <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
              {categories.isPending
                ? Array.from({ length: 8 }, (_, index) => (
                    <div key={index} className="h-36 animate-pulse rounded-3xl bg-forest/8" />
                  ))
                : categories.data.map((category) => (
                    <CategoryCard key={category.id} category={category} compact />
                  ))}
            </div>
          )}
        </div>
      </section>

      <ProductSection
        eyebrow="Featured"
        title="Fresh picks for your basket."
        products={items.slice(0, 4)}
        loading={products.isPending}
      />
      <div className="bg-mist dark:bg-white/5">
        <ProductSection
          eyebrow="Best sellers"
          title="Everyday favourites people reach for."
          products={items.slice(4, 8)}
          loading={products.isPending}
        />
      </div>

      <section className="bg-white py-20 dark:bg-[#08150f] sm:py-24">
        <div className="page-container">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf">
              Why Lomzi
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-forest dark:text-white sm:text-5xl">
              Designed around the way you actually shop.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {reasons.map(({ icon: Icon, title, copy }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="h-full p-7 dark:border-white/10 dark:bg-white/8">
                  <span className="grid size-12 place-items-center rounded-2xl bg-mint text-forest">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-extrabold text-forest dark:text-white">
                    {title}
                  </h3>
                  <p className="mt-3 leading-7 text-ink-muted dark:text-white/55">{copy}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
