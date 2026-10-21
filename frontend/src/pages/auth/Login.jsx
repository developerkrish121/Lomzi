import { AuthForm } from '@/components/auth/AuthForm';
import { AuthPageShell } from '@/components/auth/AuthPageShell';

export function Login() {
  return (
    <AuthPageShell
      eyebrow="Welcome back"
      title="Sign in to Lomzi"
      copy="Continue with the account you already created."
    >
      <AuthForm mode="login" />
    </AuthPageShell>
  );
}
