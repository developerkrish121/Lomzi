import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function SubmitButton({ loading, children }) {
  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}>
      <Button type="submit" loading={loading} className="mt-1 w-full">
        {children}
        {!loading && <ArrowRight className="size-4" />}
      </Button>
    </motion.div>
  );
}
