import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { AuthCard } from '@/components/auth/AuthCard';
import { FloatingInput } from '@/components/auth/FloatingInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { RememberMe } from '@/components/auth/RememberMe';
import { SubmitButton } from '@/components/auth/SubmitButton';
import { Loader } from '@/components/ui/Loader';
import { AdminForbiddenPage } from '@/pages/admin/AdminForbiddenPage';
import { useAuth } from '@/hooks/useAuth';
import { RouteMetadata } from '@/components/layout/RouteMetadata';
import { useToast } from '@/hooks/useToast';

const schema = z.object({
  email: z.string().trim().email('Enter a valid administrator email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean(),
});

export function AdminLoginPage() {
  const { currentUser, loading, adminLogin } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  });

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-[#0b211b]">
        <Loader label="Checking administrator session…" />
      </div>
    );
  if (currentUser?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (currentUser) return <AdminForbiddenPage />;

  const onSubmit = async (values) => {
    try {
      await adminLogin(values);
      notify('Welcome to the Admin Portal.');
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      setError('root', { message: error.message });
      notify(error.message);
    }
  };

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#0b211b] px-4 py-10 text-white sm:px-6">
      <RouteMetadata />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(214,166,107,.18),transparent_32rem),radial-gradient(circle_at_85%_80%,rgba(82,119,101,.24),transparent_34rem)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_480px]">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block"
        >
          <span className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-sun to-leaf text-forest shadow-2xl">
            <ShieldCheck className="size-8" />
          </span>
          <p className="mt-10 text-sm font-extrabold uppercase tracking-[.22em] text-mint">
            Lomzi operations
          </p>
          <h1 className="mt-4 max-w-xl font-display text-5xl font-black leading-tight">
            A secure workspace for faster grocery operations.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/55">
            Manage catalogue health, fulfilment and live business performance from one focused admin
            portal.
          </p>
        </motion.section>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
        >
          <AuthCard>
            <span className="mb-6 grid size-12 place-items-center rounded-2xl bg-forest text-sun dark:bg-white dark:text-forest">
              <LockKeyhole className="size-5" />
            </span>
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-leaf dark:text-mint">
              Admin Portal
            </p>
            <h2 className="mt-3 font-display text-3xl font-black text-forest dark:text-white">
              Administrator sign in
            </h2>
            <p className="mb-8 mt-3 text-sm leading-6 text-ink-muted dark:text-white/60">
              Use your authorized administrator credentials. Customer accounts cannot enter this
              workspace.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
              <FloatingInput
                id="admin-email"
                type="email"
                label="Admin email"
                autoComplete="username"
                error={errors.email?.message}
                {...register('email')}
              />
              <PasswordInput
                id="admin-password"
                label="Password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <RememberMe register={register} />
              {errors.root && (
                <div
                  role="alert"
                  className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-200"
                >
                  {errors.root.message}
                </div>
              )}
              <SubmitButton loading={isSubmitting}>Sign in to Admin Portal</SubmitButton>
            </form>
          </AuthCard>
        </motion.div>
      </div>
    </main>
  );
}
