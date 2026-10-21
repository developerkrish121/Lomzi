import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

export function Toast({ message, onClose }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          aria-live="polite"
          className="fixed inset-x-3 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-forest px-4 py-3 text-sm font-bold text-white shadow-2xl sm:bottom-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
        >
          <CheckCircle2 className="size-5 text-sun" />
          <span className="min-w-0 flex-1">{message}</span>
          <button
            onClick={onClose}
            aria-label="Dismiss notification"
            className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-white/10 focus-visible:ring-sun"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
