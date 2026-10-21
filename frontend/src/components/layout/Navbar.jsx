import {
  Leaf,
  LogOut,
  MapPin,
  Menu,
  PackageOpen,
  ShieldCheck,
  ShoppingBasket,
  UserRound,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';
import { useCart } from '@/hooks/useCart';

const navClass = ({ isActive }) =>
  cn(
    'inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-bold transition hover:bg-forest/6',
    isActive ? 'text-forest' : 'text-ink-muted',
  );

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { currentUser, loading, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, openDrawer } = useCart();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => event.key === 'Escape' && setOpen(false);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const handleCart = () => {
    if (!currentUser) {
      notify('Sign in to view your basket.');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    openDrawer();
  };

  const cartButton = (
    <button
      type="button"
      onClick={handleCart}
      className="relative grid size-11 place-items-center rounded-full border border-forest/10 bg-white text-forest shadow-sm transition hover:-translate-y-0.5 hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
      aria-label={`Open cart with ${cart.totalItems} items`}
    >
      <ShoppingBasket className="size-5" />
      {cart.totalItems > 0 && (
        <span
          className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-leaf px-1 text-[10px] font-extrabold text-white"
          aria-hidden="true"
        >
          {cart.totalItems > 99 ? '99+' : cart.totalItems}
        </span>
      )}
    </button>
  );

  const handleLogout = async () => {
    try {
      await logout();
      notify('You have been logged out.');
      navigate('/login');
    } catch {
      notify('The server could not confirm logout. Please try again.');
    } finally {
      setOpen(false);
    }
  };

  const accountLinks = currentUser
    ? currentUser.role === 'ADMIN'
      ? [{ label: 'Admin dashboard', to: '/admin/dashboard', icon: ShieldCheck }]
      : [
          { label: 'Account', to: '/account', icon: UserRound },
          { label: 'Orders', to: '/orders', icon: PackageOpen },
          { label: 'Addresses', to: '/addresses', icon: MapPin },
        ]
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-forest/8 bg-cream/90 backdrop-blur-xl">
      <nav
        className="page-container relative z-20 flex min-h-20 items-center justify-between gap-2 sm:gap-6"
        aria-label="Primary navigation"
      >
        <Link to="/" className="group flex items-center gap-3" aria-label="Lomzi home">
          <span className="grid size-11 place-items-center rounded-2xl bg-forest text-sun transition group-hover:-rotate-6">
            <Leaf className="size-5" strokeWidth={2.5} />
          </span>
          <span className="hidden font-display text-xl font-extrabold tracking-tight text-forest min-[360px]:inline">
            Lomzi
          </span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {cartButton}
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={navClass}>
            Products
          </NavLink>
          {accountLinks.map(({ label, to }) => (
            <NavLink key={to} to={to} className={navClass}>
              {label}
            </NavLink>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {!loading && !currentUser && (
            <>
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-bold text-forest transition hover:bg-forest/6"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-forest px-5 py-3 text-sm font-bold text-white shadow-button transition hover:bg-forest-light"
              >
                Create account
              </Link>
            </>
          )}
          {!loading && currentUser && (
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="size-4" /> Log out
            </Button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2 md:hidden">
          {cartButton}
          <Button
            variant="ghost"
            className="size-11 p-0"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-x-0 bottom-0 top-20 z-0 bg-forest/35 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              id="mobile-menu"
              className="absolute inset-x-0 top-full z-10 max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-forest/8 bg-cream/98 px-4 py-4 shadow-lift md:hidden"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className="mx-auto max-w-xl">
                <NavLink
                  to="/"
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 font-bold text-forest hover:bg-forest/6"
                >
                  Home
                </NavLink>
                <NavLink
                  to="/products"
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 font-bold text-forest hover:bg-forest/6"
                >
                  Products
                </NavLink>
                {accountLinks.map(({ label, to, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold text-forest hover:bg-forest/6"
                  >
                    <Icon className="size-4" />
                    {label}
                  </NavLink>
                ))}
                {!loading && !currentUser && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-forest/12 bg-white px-4 py-3 text-center text-sm font-bold text-forest"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="rounded-full bg-forest px-4 py-3 text-center text-sm font-bold text-white"
                    >
                      Create account
                    </Link>
                  </div>
                )}
                {!loading && currentUser && (
                  <Button variant="secondary" className="mt-3 w-full" onClick={handleLogout}>
                    <LogOut className="size-4" /> Log out
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
