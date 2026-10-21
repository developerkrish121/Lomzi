import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';

export function LoadingPage() {
  const navigate = useNavigate();
  return (
    <section className="page-container grid min-h-[62vh] place-items-center py-20 text-center">
      <div>
        <Loader label="Preparing your experience…" />
        <p className="mx-auto mt-5 max-w-sm text-ink-muted">
          This reusable state keeps longer operations clear and accessible.
        </p>
        <Button variant="secondary" className="mt-8" onClick={() => navigate('/')}>
          Return home
        </Button>
      </div>
    </section>
  );
}
