import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CategoryIcon } from '@/components/discovery/CategoryIcon';

export function CategoryCard({ category, compact = false }) {
  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={`/products?category=${category.slug}`}
        className={`group flex h-full flex-col items-center text-center ${compact ? 'gap-3 rounded-3xl p-4' : 'gap-5 rounded-card border border-forest/8 bg-white p-6 shadow-soft'} transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf dark:border-white/10 dark:bg-white/8`}
      >
        <span
          className={`${compact ? 'size-14' : 'size-16'} grid place-items-center rounded-3xl bg-mint text-forest transition duration-300 group-hover:rotate-3 group-hover:bg-sun`}
        >
          <CategoryIcon icon={category.icon} />
        </span>
        <span>
          <strong className="font-display text-base font-extrabold text-forest dark:text-white">
            {category.name}
          </strong>
          {!compact && (
            <small className="mt-1 block text-ink-muted dark:text-white/55">
              {category._count?.products ?? 0} essentials
            </small>
          )}
        </span>
      </Link>
    </motion.div>
  );
}
