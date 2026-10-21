import {
  Boxes,
  ChartNoAxesCombined,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  ShoppingBasket,
  Tags,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { cn } from '@/utils/cn';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
];

export function AdminSidebar() {
  const { sidebarOpen, sidebarCollapsed, closeSidebar, toggleCollapsed } = useAdmin();
  return (
    <>
      <button
        aria-label="Close navigation"
        onClick={closeSidebar}
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm lg:hidden',
          sidebarOpen ? 'block' : 'hidden',
        )}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-[#102219] text-white shadow-2xl transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          sidebarCollapsed ? 'w-20' : 'w-72',
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <NavLink
            to="/admin/dashboard"
            onClick={closeSidebar}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sun to-leaf text-forest">
              <ShoppingBasket className="size-5" />
            </span>
            {!sidebarCollapsed && (
              <span className="font-display text-lg font-extrabold">
                Lomzi{' '}
                <small className="block text-[10px] uppercase tracking-[.2em] text-white/50">
                  Admin
                </small>
              </span>
            )}
          </NavLink>
          <button
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="rounded-xl p-2 hover:bg-white/10 lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 space-y-2 p-4">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              title={sidebarCollapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 items-center gap-3 rounded-2xl px-3 font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun',
                  isActive
                    ? 'bg-white text-forest shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                  sidebarCollapsed && 'justify-center',
                )
              }
            >
              <Icon className="size-5 shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            onClick={toggleCollapsed}
            className="hidden w-full items-center justify-center gap-2 rounded-2xl p-3 text-sm font-bold text-white/60 hover:bg-white/10 hover:text-white lg:flex"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={cn('size-4 transition', sidebarCollapsed && 'rotate-180')} />
            {!sidebarCollapsed && 'Collapse'}
          </button>
          {!sidebarCollapsed && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/5 p-3 text-xs text-white/50">
              <ChartNoAxesCombined className="size-4 text-leaf" /> Live operational data
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
