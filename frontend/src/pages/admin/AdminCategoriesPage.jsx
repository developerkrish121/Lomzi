import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminEmpty, AdminError, AdminSkeleton } from '@/components/admin/AdminStates';
import { Pagination } from '@/components/admin/Pagination';
import { CategoryIcon } from '@/components/discovery/CategoryIcon';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { adminError } from '@/features/admin/api';
import { useAdminCategories, useAdminMutations } from '@/features/admin/hooks';
import { categorySchema } from '@/features/admin/schemas';
import { useToast } from '@/hooks/useToast';

const input =
  'min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/10';
export function AdminCategoriesPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { notify } = useToast();
  const query = useAdminCategories({ page, limit: 12, q });
  const mutations = useAdminMutations();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', icon: '', description: '' },
  });
  const openForm = (category = null) => {
    setEditing(category ?? {});
    reset(
      category
        ? { name: category.name, icon: category.icon, description: category.description ?? '' }
        : { name: '', icon: '', description: '' },
    );
  };
  const submit = async (values) => {
    try {
      const body = { ...values, description: values.description || null };
      if (editing.id) await mutations.updateCategory.mutateAsync({ id: editing.id, body });
      else await mutations.createCategory.mutateAsync(body);
      notify(editing.id ? 'Category updated' : 'Category created');
      setEditing(null);
    } catch (error) {
      notify(adminError(error));
    }
  };
  const remove = async () => {
    try {
      await mutations.deleteCategory.mutateAsync(deleting.id);
      notify('Category deleted');
      setDeleting(null);
    } catch (error) {
      notify(adminError(error));
    }
  };
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Categories"
        description="Organize the catalogue into clear, searchable customer collections."
        action={
          <Button onClick={() => openForm()}>
            <Plus className="size-4" />
            Create category
          </Button>
        }
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQ(search);
        }}
        className="relative mb-5 max-w-xl"
      >
        <Search className="absolute left-4 top-3.5 size-4 text-slate-400" />
        <input
          aria-label="Search categories"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories"
          className={`${input} pl-11`}
        />
      </form>
      {query.isLoading ? (
        <AdminSkeleton />
      ) : query.isError ? (
        <AdminError message="Categories could not be loaded." retry={query.refetch} />
      ) : !query.data.categories.length ? (
        <AdminEmpty title="No categories found" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {query.data.categories.map((category) => (
              <article
                key={category.id}
                className="group flex min-w-0 items-center gap-4 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-leaf/25 hover:shadow-lg sm:p-5"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-mint text-forest transition duration-200 group-hover:bg-sun">
                  <CategoryIcon icon={category.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-lg font-extrabold text-slate-900">
                    {category.name}
                  </h2>
                  <p className="text-sm text-slate-500">{category._count.products} products</p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openForm(category)}
                    aria-label={`Edit ${category.name}`}
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-slate-600 transition hover:bg-mist hover:text-forest focus-visible:ring-2 focus-visible:ring-leaf"
                  >
                    <Edit3 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(category)}
                    aria-label={`Delete ${category.name}`}
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-red-600 transition hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <Pagination pagination={query.data.pagination} onPage={setPage} />
        </>
      )}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit category' : 'Create category'}
      >
        <form onSubmit={handleSubmit(submit)} className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold">
            Name
            <input {...register('name')} className={input} />
            {errors.name && <small className="text-red-600">{errors.name.message}</small>}
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Icon or emoji
            <input {...register('icon')} placeholder="e.g. 🍎" className={input} />
            {errors.icon && <small className="text-red-600">{errors.icon.message}</small>}
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Description
            <textarea {...register('description')} rows="3" className={`${input} py-3`} />
          </label>
          <Button
            type="submit"
            loading={mutations.createCategory.isPending || mutations.updateCategory.isPending}
          >
            {editing?.id ? 'Save changes' : 'Create category'}
          </Button>
        </form>
      </Modal>
      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
      >
        <p className="text-sm text-slate-600">
          Deletion is only allowed when the category contains no products.
        </p>
        <Button
          onClick={remove}
          loading={mutations.deleteCategory.isPending}
          className="mt-5 bg-red-700 hover:bg-red-800"
        >
          Delete category
        </Button>
      </Modal>
    </>
  );
}
