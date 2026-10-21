import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Image as ImageIcon, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminError, AdminSkeleton } from '@/components/admin/AdminStates';
import { Button } from '@/components/ui/Button';
import { ProductImage } from '@/components/discovery/ProductImage';
import { adminError } from '@/features/admin/api';
import { useAdminCategories, useAdminMutations, useAdminProduct } from '@/features/admin/hooks';
import { productSchema } from '@/features/admin/schemas';
import { useToast } from '@/hooks/useToast';

const defaults = {
  name: '',
  description: '',
  categoryId: '',
  price: '',
  discountPrice: '',
  stock: 0,
  unit: '',
  image: '',
  isAvailable: true,
};
function Field({ label, error, children }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>{label}</span>
      {children}
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error.message}
        </span>
      )}
    </label>
  );
}
const inputClass =
  'min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-leaf/10';
export function AdminProductFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useToast();
  const productQuery = useAdminProduct(id);
  const categoriesQuery = useAdminCategories();
  const mutations = useAdminMutations();
  const mutation = editing ? mutations.updateProduct : mutations.createProduct;
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(productSchema), defaultValues: defaults });
  useEffect(() => {
    if (productQuery.data)
      reset({
        ...productQuery.data,
        price: Number(productQuery.data.price),
        discountPrice:
          productQuery.data.discountPrice === null ? '' : Number(productQuery.data.discountPrice),
      });
  }, [productQuery.data, reset]);
  const image = watch('image');
  if ((editing && productQuery.isLoading) || categoriesQuery.isLoading)
    return <AdminSkeleton rows={6} />;
  if (productQuery.isError || categoriesQuery.isError)
    return (
      <AdminError
        message="The product form could not be prepared."
        retry={() => {
          productQuery.refetch();
          categoriesQuery.refetch();
        }}
      />
    );
  const submit = async (values) => {
    try {
      const body = {
        ...values,
        discountPrice: values.discountPrice === '' ? null : values.discountPrice,
      };
      if (editing) await mutation.mutateAsync({ id, body });
      else await mutation.mutateAsync(body);
      notify(editing ? 'Product updated' : 'Product created');
      navigate('/admin/products');
    } catch (error) {
      notify(adminError(error));
    }
  };
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title={editing ? 'Edit product' : 'Create product'}
        description="Keep product information accurate for customers and fulfilment."
        action={
          <Link
            to="/admin/products"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-forest ring-1 ring-slate-200"
          >
            <ArrowLeft className="size-4" />
            Products
          </Link>
        }
      />
      <form
        onSubmit={handleSubmit(submit)}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <section className="grid gap-5 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7">
          <div className="sm:col-span-2">
            <Field label="Product name" error={errors.name}>
              <input {...register('name')} className={inputClass} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description" error={errors.description}>
              <textarea {...register('description')} rows="5" className={`${inputClass} py-3`} />
            </Field>
          </div>
          <Field label="Category" error={errors.categoryId}>
            <select {...register('categoryId')} className={inputClass}>
              <option value="">Select category</option>
              {categoriesQuery.data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Unit" error={errors.unit}>
            <input {...register('unit')} placeholder="e.g. 1 kg" className={inputClass} />
          </Field>
          <Field label="Price (₹)" error={errors.price}>
            <input type="number" step="0.01" {...register('price')} className={inputClass} />
          </Field>
          <Field label="Discount price (₹)" error={errors.discountPrice}>
            <input
              type="number"
              step="0.01"
              {...register('discountPrice')}
              className={inputClass}
            />
          </Field>
          <Field label="Stock" error={errors.stock}>
            <input type="number" {...register('stock')} className={inputClass} />
          </Field>
          <Field label="Availability">
            <span className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 px-4">
              <input type="checkbox" {...register('isAvailable')} className="size-5 accent-leaf" />
              Visible and purchasable
            </span>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Image URL" error={errors.image}>
              <input {...register('image')} className={inputClass} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={mutation.isPending} className="w-full sm:w-auto">
              <Save className="size-4" />
              {editing ? 'Save changes' : 'Create product'}
            </Button>
          </div>
        </section>
        <aside className="rounded-3xl bg-[#102219] p-5 text-white shadow-xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-white/50">
            Image preview
          </p>
          <div className="grid aspect-square place-items-center overflow-hidden rounded-3xl bg-white/10">
            {image && /^https?:\/\//.test(image) ? (
              <ProductImage
                src={image}
                alt="Product preview"
                decoding="async"
                className="size-full object-cover"
              />
            ) : (
              <ImageIcon className="size-12 text-white/30" />
            )}
          </div>
          <p className="mt-4 text-sm leading-6 text-white/60">
            Use a square, high-resolution image hosted over HTTPS.
          </p>
        </aside>
      </form>
    </>
  );
}
