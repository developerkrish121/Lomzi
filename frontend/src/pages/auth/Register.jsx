import { AuthForm } from '@/components/auth/AuthForm';
import { AuthPageShell } from '@/components/auth/AuthPageShell';

export function Register() {
  return (
    <AuthPageShell
      eyebrow="Join Lomzi"
      title="Create your account"
      copy="Set up secure access and start building your first basket."
    >
      <AuthForm mode="register" />
    </AuthPageShell>
  );
}
