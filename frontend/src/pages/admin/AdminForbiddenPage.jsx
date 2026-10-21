import { ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';
export function AdminForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream p-5">
      <div className="max-w-lg rounded-card bg-white p-10 text-center shadow-soft">
        <ShieldX className="mx-auto mb-5 size-14 text-red-500" />
        <p className="text-sm font-extrabold uppercase tracking-[.2em] text-red-500">
          403 · Access denied
        </p>
        <h1 className="mt-3 font-display text-3xl font-black text-forest">
          Administrator access required
        </h1>
        <p className="mt-3 text-ink-muted">You are not authorized to access the Admin Portal.</p>
        <Link
          to="/"
          className="mt-7 inline-flex min-h-11 items-center rounded-full bg-forest px-6 font-bold text-white"
        >
          Return to store
        </Link>
      </div>
    </main>
  );
}
