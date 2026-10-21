import { motion } from 'framer-motion';
import { AddressBook } from '@/components/checkout/AddressBook';

export function AddressPage() {
  return (
    <section className="page-container py-12 sm:py-20">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf">
          Saved locations
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-forest sm:text-5xl">
          Address management
        </h1>
        <div className="mt-10">
          <AddressBook />
        </div>
      </motion.div>
    </section>
  );
}
