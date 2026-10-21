import { ArrowLeft, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <section className="page-container grid min-h-[62vh] place-items-center py-20 text-center">
      <div className="max-w-xl">
        <span className="mx-auto grid size-20 place-items-center rounded-[2rem] bg-mint text-forest">
          <Sprout className="size-9" />
        </span>
        <p className="mt-8 text-sm font-extrabold uppercase tracking-[0.2em] text-leaf">
          404 — page not found
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-forest sm:text-5xl">
          Nothing growing here yet.
        </h1>
        <p className="mt-5 text-lg leading-8 text-ink-muted">
          The page may have moved, or the address might need another look.
        </p>
        <Button className="mt-8" onClick={() => navigate('/')}>
          <ArrowLeft className="size-4" /> Back to home
        </Button>
      </div>
    </section>
  );
}
