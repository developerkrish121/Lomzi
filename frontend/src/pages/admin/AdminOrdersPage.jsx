import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminEmpty, AdminError, AdminSkeleton } from '@/components/admin/AdminStates';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useAdminOrders } from '@/features/admin/hooks';
import { formatPrice } from '@/features/discovery/format';

const statuses = ['PENDING', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const input =
  'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/10';
export function AdminOrdersPage() {
  const [sp, setSp] = useSearchParams();
  const [search, setSearch] = useState(sp.get('q') ?? '');
  const params = {
    page: Number(sp.get('page') ?? 1),
    limit: 15,
    q: sp.get('q') ?? '',
    status: sp.get('status') || undefined,
  };
  const query = useAdminOrders(params);
  const setParam = (key, value) =>
    setSp((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.set('page', '1');
      return next;
    });
  return (
    <>
      <AdminPageHeader
        eyebrow="Fulfilment"
        title="Orders"
        description="Track every customer order and move it safely through fulfilment."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParam('q', search);
        }}
        className="mb-5 grid gap-3 rounded-3xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px]"
      >
        <label className="relative">
          <Search className="absolute left-4 top-3.5 size-4 text-slate-400" />
          <span className="sr-only">Search orders</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order ID, customer or email"
            className={`${input} w-full pl-11`}
          />
        </label>
        <select
          aria-label="Filter status"
          value={params.status ?? ''}
          onChange={(e) => setParam('status', e.target.value)}
          className={input}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </form>
      {query.isLoading ? (
        <AdminSkeleton rows={6} />
      ) : query.isError ? (
        <AdminError message="Orders could not be loaded." retry={query.refetch} />
      ) : !query.data.orders.length ? (
        <AdminEmpty title="No orders found" />
      ) : (
        <>
          <div className="grid gap-4">
            {query.data.orders.map((order) => (
              <article
                key={order.id}
                className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[1.2fr_1.4fr_.7fr_.8fr_.8fr_auto] lg:items-center"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Order</p>
                  <strong className="text-sm text-slate-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </strong>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Customer
                  </p>
                  <strong className="block truncate text-sm">{order.user.name}</strong>
                  <small className="block truncate text-slate-500">{order.user.email}</small>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Date</p>
                  <span className="text-sm">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Items</p>
                  <span className="text-sm">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total · COD
                  </p>
                  <strong>{formatPrice(order.totalAmount)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3 lg:justify-end">
                  <StatusBadge status={order.status} />
                  <Link
                    aria-label={`View order ${order.id}`}
                    to={`/admin/orders/${order.id}`}
                    className="grid size-10 place-items-center rounded-xl bg-mist text-forest"
                  >
                    <Eye className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <Pagination pagination={query.data.pagination} onPage={(p) => setParam('page', p)} />
        </>
      )}
    </>
  );
}
