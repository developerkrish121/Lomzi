import { Leaf, ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { AuthCard } from '@/components/auth/AuthCard';
import { Loader } from '@/components/ui/Loader';
import { useAuth } from '@/hooks/useAuth';

export function AuthPageShell({ eyebrow, title, copy, children }) {
  const { currentUser, loading } = useAuth();
  if (loading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader label="Checking your session…" />
      </div>
    );
  if (currentUser)
    return <Navigate to={currentUser.role === 'ADMIN' ? '/admin/dashboard' : '/'} replace />;

  return (
    <section className="auth-stage relative overflow-hidden py-10 sm:py-16 lg:py-20">
      <div aria-hidden="true" className="auth-mesh absolute inset-0" />
      <div aria-hidden="true" className="hero-orb hero-orb-one" />
      <div aria-hidden="true" className="hero-orb hero-orb-two" />
      <div className="page-container relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <span className="grid size-14 place-items-center rounded-2xl bg-forest text-sun shadow-button dark:bg-white dark:text-forest">
            <Leaf />
          </span>
          <p className="mt-10 text-sm font-extrabold uppercase tracking-[0.18em] text-leaf dark:text-mint">
            A calmer grocery experience
          </p>
          <h2 className="mt-4 max-w-lg font-display text-5xl font-extrabold tracking-tight text-forest dark:text-white">
            Your essentials, with less friction.
          </h2>
          <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-ink-muted dark:text-white/60">
            <ShieldCheck className="size-5 text-leaf dark:text-mint" /> Secure, private account
            access
          </div>
        </div>
        <AuthCard>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf dark:text-mint">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-forest dark:text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mb-8 mt-3 leading-7 text-ink-muted dark:text-white/60">{copy}</p>
          {children}
        </AuthCard>
      </div>
    </section>
  );
}
