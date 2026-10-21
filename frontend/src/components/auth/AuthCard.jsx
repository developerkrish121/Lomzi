import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export function AuthCard({ children, className }) {
  return (
    <motion.div
      className={cn(
        'auth-glass-card relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] p-6 shadow-2xl sm:p-10',
        className,
      )}
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
      />
      {children}
    </motion.div>
  );
}
