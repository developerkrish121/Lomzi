import { motion } from 'framer-motion';
import { Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export function AccountPage() {
  const { currentUser } = useAuth();
  const { notify } = useToast();
  const location = useLocation();
  useEffect(() => {
    if (location.state?.accessDenied) notify('Administrator access is required.');
  }, [location.state, notify]);

  const details = [
    { icon: Mail, label: 'Email', value: currentUser.email },
    { icon: Phone, label: 'Phone', value: currentUser.phone || 'Not provided' },
    {
      icon: ShieldCheck,
      label: 'Role',
      value: currentUser.role === 'ADMIN' ? 'Administrator' : 'Customer',
    },
  ];

  return (
    <section className="page-container py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-leaf">
              Your account
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-forest sm:text-5xl">
              Good to see you, {currentUser.name.split(' ')[0]}.
            </h1>
          </div>
          <span className="grid size-16 place-items-center rounded-3xl bg-mint text-forest">
            <UserRound className="size-7" />
          </span>
        </div>
        <Card className="mt-10 divide-y divide-forest/8 overflow-hidden">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-5 sm:p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-mist text-leaf">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-muted">
                  {label}
                </p>
                <p className="mt-1 font-bold text-forest">{value}</p>
              </div>
            </div>
          ))}
        </Card>
      </motion.div>
    </section>
  );
}
