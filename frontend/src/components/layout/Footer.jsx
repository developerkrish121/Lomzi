import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-forest/8 bg-white">
      <div className="page-container flex flex-col items-center justify-between gap-5 py-8 text-center sm:flex-row sm:text-left">
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-forest">
          <Leaf className="size-5 text-leaf" /> Lomzi
        </Link>
        <p className="text-sm text-ink-muted">Everyday finds, made simple.</p>
        <p className="text-sm text-ink-muted">© {new Date().getFullYear()} Lomzi</p>
      </div>
    </footer>
  );
}
