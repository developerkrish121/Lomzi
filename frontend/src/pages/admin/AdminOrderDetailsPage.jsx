import { ArrowLeft, Banknote, MapPin, Package, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminError, AdminSkeleton } from '@/components/admin/AdminStates';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { adminError } from '@/features/admin/api';
import { ProductImage } from '@/components/discovery/ProductImage';
import { useAdminOrder, useOrderStatusMutation } from '@/features/admin/hooks';
import { formatPrice } from '@/features/discovery/format';
import { useToast } from '@/hooks/useToast';

const transitions = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKING', 'CANCELLED'],
  PACKING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};
const timeline = ['PENDING', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
export function AdminOrderDetailsPage() {
  const { id } = useParams();
  const query = useAdminOrder(id);
  const mutation = useOrderStatusMutation(id);
  const { notify } = useToast();
  if (query.isLoading) return <AdminSkeleton rows={6} />;
  if (query.isError)
    return <AdminError message="Order details could not be loaded." retry={query.refetch} />;
  const order = query.data;
  const next = transitions[order.status];
  const update = async (status) => {
    try {
      await mutation.mutateAsync({ id, status });
      notify(`Order moved to ${status.replaceAll('_', ' ')}`);
    } catch (error) {
      notify(adminError(error));
    }
  };
  return (
    <>
      <AdminPageHeader
        eyebrow="Order details"
        title={`#${order.id.slice(0, 8).toUpperCase()}`}
        description={`Placed ${new Date(order.createdAt).toLocaleString('en-IN')}`}
        action={
          <Link
            to="/admin/orders"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-forest ring-1 ring-slate-200"
          >
            <ArrowLeft className="size-4" />
            Orders
          </Link>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-6">
          <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold">Products</h2>
              <StatusBadge status={order.status} />
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <ProductImage
                    src={item.product.image}
                    alt=""
                    className="size-16 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold">{item.product.name}</h3>
                    <p className="text-sm text-slate-500">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <strong>{formatPrice(Number(item.price) * item.quantity)}</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-5 font-display text-xl font-extrabold">Status timeline</h2>
            <div className="grid gap-4 sm:grid-cols-5">
              {timeline.map((status, i) => {
                const currentIndex = timeline.indexOf(order.status);
                const active = order.status !== 'CANCELLED' && i <= currentIndex;
                return (
                  <div key={status} className="relative">
                    <span
                      className={`grid size-9 place-items-center rounded-full text-xs font-black ${active ? 'bg-forest text-white' : 'bg-slate-100 text-slate-400'}`}
                    >
                      {i + 1}
                    </span>
                    <p className="mt-2 text-xs font-bold text-slate-600">
                      {status.replaceAll('_', ' ')}
                    </p>
                  </div>
                );
              })}
            </div>
            {order.status === 'CANCELLED' && (
              <p className="mt-5 rounded-2xl bg-red-50 p-4 font-bold text-red-700">
                This order was cancelled and its stock was restored.
              </p>
            )}
          </section>
        </div>
        <aside className="grid content-start gap-5">
          <section className="rounded-3xl bg-[#102219] p-6 text-white">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
              <UserRound className="size-5 text-sun" />
              Customer
            </h2>
            <p className="mt-4 font-bold">{order.user.name}</p>
            <p className="text-sm text-white/60">{order.user.email}</p>
            {order.user.phone && <p className="text-sm text-white/60">{order.user.phone}</p>}
          </section>
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
              <MapPin className="size-5 text-leaf" />
              Delivery address
            </h2>
            <address className="mt-4 text-sm not-italic leading-6 text-slate-600">
              {order.address.fullName}
              <br />
              {order.address.addressLine1}
              {order.address.addressLine2 && (
                <>
                  <br />
                  {order.address.addressLine2}
                </>
              )}
              <br />
              {order.address.city}, {order.address.state} {order.address.postalCode}
              <br />
              {order.address.country}
              <br />
              {order.address.phone}
            </address>
          </section>
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
              <Banknote className="size-5 text-leaf" />
              Payment & totals
            </h2>
            <p className="mt-3 rounded-xl bg-mist px-3 py-2 text-sm font-bold">Cash on Delivery</p>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd>{formatPrice(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-black">
                <dt>Total</dt>
                <dd>{formatPrice(order.totalAmount)}</dd>
              </div>
            </dl>
          </section>
          {next.length > 0 && (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-extrabold">
                <Package className="size-5 text-leaf" />
                Update status
              </h2>
              <div className="grid gap-2">
                {next.map((status) => (
                  <Button
                    key={status}
                    variant={status === 'CANCELLED' ? 'secondary' : 'primary'}
                    loading={mutation.isPending}
                    onClick={() => update(status)}
                  >
                    {status === 'CANCELLED'
                      ? 'Cancel order'
                      : `Move to ${status.replaceAll('_', ' ')}`}
                  </Button>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
