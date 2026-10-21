import { Edit3, PackagePlus, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminEmpty, AdminError, AdminSkeleton } from '@/components/admin/AdminStates';
import { Pagination } from '@/components/admin/Pagination';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { adminError } from '@/features/admin/api';
import { ProductImage } from '@/components/discovery/ProductImage';
import { useAdminCategories, useAdminMutations, useAdminProducts } from '@/features/admin/hooks';
import { formatPrice } from '@/features/discovery/format';
import { useToast } from '@/hooks/useToast';

const control =
  'min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/10';
export function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { notify } = useToast();
  const mutations = useAdminMutations();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [target, setTarget] = useState(null);
  const [stock, setStock] = useState('');
  const params = {
    page: Number(searchParams.get('page') ?? 1),
    limit: 12,
    q: searchParams.get('q') ?? '',
    categoryId: searchParams.get('categoryId') || undefined,
    availability: searchParams.get('availability') || undefined,
    stock: searchParams.get('stock') || undefined,
    sort: searchParams.get('sort') || 'newest',
  };
  const query = useAdminProducts(params);
  const categories = useAdminCategories();
  const updateParam = (key, value) =>
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.set('page', '1');
      return next;
    });
  const act = async (action, success) => {
    try {
      await action();
      notify(success);
      setTarget(null);
    } catch (error) {
      notify(adminError(error));
    }
  };
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Search, filter and maintain the products available in Lomzi."
        action={
          <Link
            to="/admin/products/new"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-bold text-white shadow-button"
          >
            <Plus className="size-4" />
            Create product
          </Link>
        }
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam('q', search);
        }}
        className="mb-5 grid gap-3 rounded-3xl bg-white/80 p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_repeat(4,180px)]"
      >
        <label className="relative">
          <span className="sr-only">Search products</span>
          <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            className={`${control} w-full pl-10`}
          />
        </label>
        <select
          aria-label="Filter category"
          value={params.categoryId ?? ''}
          onChange={(e) => updateParam('categoryId', e.target.value)}
          className={control}
        >
          <option value="">All categories</option>
          {categories.data?.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter availability"
          value={params.availability ?? ''}
          onChange={(e) => updateParam('availability', e.target.value)}
          className={control}
        >
          <option value="">Any availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <select
          aria-label="Filter stock"
          value={params.stock ?? ''}
          onChange={(e) => updateParam('stock', e.target.value)}
          className={control}
        >
          <option value="">Any stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
        <select
          aria-label="Sort products"
          value={params.sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className={control}
        >
          <option value="newest">Newest</option>
          <option value="name">Name</option>
          <option value="price-asc">Price low to high</option>
          <option value="price-desc">Price high to low</option>
          <option value="stock-asc">Stock low to high</option>
        </select>
      </form>
      {query.isLoading ? (
        <AdminSkeleton rows={6} />
      ) : query.isError ? (
        <AdminError message="Products could not be loaded." retry={query.refetch} />
      ) : !query.data.products.length ? (
        <AdminEmpty
          title="No products found"
          message="Adjust the filters or create a new product."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {query.data.products.map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_12px_35px_rgba(15,35,25,.06)]"
              >
                <div className="relative aspect-[16/10] bg-mist">
                  <ProductImage
                    src={p.image}
                    alt={`${p.name} product`}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${p.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}
                  >
                    {p.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-leaf">
                    {p.category.name}
                  </p>
                  <h2 className="mt-1 truncate font-display text-lg font-extrabold text-slate-900">
                    {p.name}
                  </h2>
                  <div className="mt-3 flex items-center justify-between">
                    <strong>{formatPrice(p.discountPrice ?? p.price)}</strong>
                    <span className={p.stock <= 10 ? 'font-bold text-amber-700' : 'text-slate-500'}>
                      {p.stock} in stock
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-mist text-sm font-bold text-forest"
                    >
                      <Edit3 className="size-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        setTarget({ type: 'stock', product: p });
                        setStock(String(p.stock));
                      }}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-mint text-sm font-bold text-forest"
                    >
                      <PackagePlus className="size-4" />
                      Stock
                    </button>
                    <button
                      onClick={() =>
                        act(
                          () => mutations.toggleProduct.mutateAsync(p.id),
                          `Product ${p.isAvailable ? 'hidden' : 'made available'}`,
                        )
                      }
                      className="min-h-11 rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-700"
                    >
                      <SlidersHorizontal className="mr-1 inline size-4" />
                      Toggle
                    </button>
                    <button
                      onClick={() => setTarget({ type: 'delete', product: p })}
                      className="min-h-11 rounded-xl bg-red-50 px-3 text-sm font-bold text-red-700"
                    >
                      <Trash2 className="mr-1 inline size-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Pagination
            pagination={query.data.pagination}
            onPage={(page) => updateParam('page', page)}
          />
        </>
      )}
      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title={
          target?.type === 'stock'
            ? `Update ${target.product.name} stock`
            : `Delete ${target?.product.name}?`
        }
      >
        {target?.type === 'stock' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              act(
                () =>
                  mutations.updateStock.mutateAsync({
                    id: target.product.id,
                    stock: Number(stock),
                  }),
                'Stock updated',
              );
            }}
            className="grid gap-4"
          >
            <label className="grid gap-2 text-sm font-bold">
              Available units
              <input
                min="0"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={control}
              />
            </label>
            <Button type="submit" disabled={stock === '' || Number(stock) < 0}>
              Update stock
            </Button>
          </form>
        ) : (
          <div>
            <p className="text-sm text-slate-600">
              This product will be removed from the customer catalogue. Existing order history
              remains intact.
            </p>
            <Button
              onClick={() =>
                act(() => mutations.deleteProduct.mutateAsync(target.product.id), 'Product deleted')
              }
              className="mt-5 bg-red-700 hover:bg-red-800"
            >
              Delete product
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
