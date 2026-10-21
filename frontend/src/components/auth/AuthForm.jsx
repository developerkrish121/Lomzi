import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { RememberMe } from '@/components/auth/RememberMe';
import { SubmitButton } from '@/components/auth/SubmitButton';
import { FloatingInput } from '@/components/auth/FloatingInput';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

const email = z.string().trim().email('Enter a valid email address');
const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean(),
});
const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
    email,
    phone: z
      .string()
      .trim()
      .refine((value) => !value || /^\+?[1-9]\d{7,14}$/.test(value), 'Enter a valid phone number'),
    password: z.string().min(8, 'Use at least 8 characters').max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { login, register: createAccount } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      remember: true,
    },
  });

  const onSubmit = async (values) => {
    try {
      if (isRegister) {
        const payload = { ...values };
        delete payload.confirmPassword;
        await createAccount(payload);
        notify('Your Lomzi account is ready.');
      } else {
        const user = await login(values);
        notify('Welcome back.');
        if (user.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
      }
      navigate('/', { replace: true });
    } catch (error) {
      setError('root', { message: error.message });
      notify(error.message);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      noValidate
    >
      {isRegister && (
        <FloatingInput
          id="name"
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
      )}
      <FloatingInput
        id="email"
        type="email"
        label="Email address"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      {isRegister && (
        <FloatingInput
          id="phone"
          type="tel"
          label="Phone number (optional)"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
      )}
      <PasswordInput
        id="password"
        label="Password"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        error={errors.password?.message}
        {...register('password')}
      />
      {isRegister && (
        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      )}
      {!isRegister && <RememberMe register={register} />}
      {errors.root && (
        <div
          role="alert"
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-200"
        >
          {errors.root.message}
        </div>
      )}
      <SubmitButton loading={isSubmitting}>
        {isRegister ? 'Create account' : 'Sign in'}
      </SubmitButton>
      <p className="text-center text-sm text-ink-muted dark:text-white/60">
        {isRegister ? 'Already have an account?' : 'New to Lomzi?'}{' '}
        <Link
          className="font-bold text-forest underline decoration-leaf/40 underline-offset-4 hover:decoration-leaf dark:text-white dark:decoration-mint/50"
          to={isRegister ? '/login' : '/register'}
        >
          {isRegister ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </motion.form>
  );
}
