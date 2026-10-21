import { ChevronDown, LogOut, Menu, ShoppingBag, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';

const names = {
  dashboard: 'Dashboard',
  products: 'Products',
  new: 'New product',
  edit: 'Edit product',
  categories: 'Categories',
  orders: 'Orders',
};

export function AdminTopbar() {
  const { toggleSidebar } = useAdmin();
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const parts = location.pathname.split('/').filter(Boolean).slice(1);
  const signOut = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[#f6f8f6]/85 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={toggleSidebar}
            aria-label="Open navigation"
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-forest shadow-sm ring-1 ring-slate-200 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">
              Admin workspace
            </p>
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-1 text-sm text-slate-500"
            >
              <Link to="/admin/dashboard" className="hover:text-forest">
                Admin
              </Link>
              {parts.map((part, index) => (
                <span key={`${part}-${index}`} className="flex min-w-0 items-center gap-1">
                  <span>/</span>
                  <span className="truncate capitalize text-slate-700">
                    {names[part] ?? (part.length > 18 ? 'Details' : part)}
                  </span>
                </span>
              ))}
            </nav>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-controls="admin-account-menu"
            className="flex items-center gap-2 rounded-2xl bg-white p-2 pr-3 shadow-sm ring-1 ring-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-mint text-forest">
              <UserRound className="size-4" />
            </span>
            <span className="hidden text-left sm:block">
              <strong className="block max-w-36 truncate text-sm text-forest">
                {currentUser.name}
              </strong>
              <small className="text-slate-500">Administrator</small>
            </span>
            <ChevronDown className="size-4 text-slate-400" />
          </button>
          {menuOpen && (
            <div
              id="admin-account-menu"
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              <Link
                role="menuitem"
                to="/"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-mist"
              >
                <ShoppingBag className="size-4" />
                Customer store
              </Link>
              <button
                role="menuitem"
                onClick={signOut}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
