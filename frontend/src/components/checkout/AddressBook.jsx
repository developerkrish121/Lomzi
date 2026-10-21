import { useId, useState } from 'react';
import { Check, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AddressForm } from '@/components/checkout/AddressForm';
import { CheckoutSkeleton } from '@/components/checkout/CheckoutSkeleton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { checkoutError, useAddresses, useAddressMutations } from '@/features/checkout/hooks';
import { useToast } from '@/hooks/useToast';

export function AddressBook({ selectedId, onSelect, compact = false }) {
  const query = useAddresses();
  const mutations = useAddressMutations();
  const { notify } = useToast();
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const addressFormId = useId();
  const savingAddress = mutations.createAddress.isPending || mutations.updateAddress.isPending;
  const save = async (input) => {
    try {
      const address = editing?.id
        ? await mutations.updateAddress.mutateAsync({ id: editing.id, input })
        : await mutations.createAddress.mutateAsync(input);
      notify(editing?.id ? 'Address updated.' : 'Address added.');
      setEditing(undefined);
      onSelect?.(address.id);
    } catch (error) {
      notify(checkoutError(error));
    }
  };
  const remove = async () => {
    try {
      await mutations.deleteAddress.mutateAsync(deleting.id);
      notify('Address deleted.');
      setDeleting(null);
      if (selectedId === deleting.id) onSelect?.(null);
    } catch (error) {
      notify(checkoutError(error));
    }
  };

  if (query.isPending) return <CheckoutSkeleton />;
  if (query.isError)
    return (
      <div className="rounded-[2rem] bg-white/70 p-8 text-center shadow-soft">
        <p className="font-bold text-forest">Addresses could not be loaded.</p>
        <Button className="mt-4" onClick={() => query.refetch()}>
          Try again
        </Button>
      </div>
    );
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-forest">Delivery addresses</h2>
          <p className="mt-1 text-sm text-ink-muted">Choose where your basket should arrive.</p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
      {query.data.length === 0 ? (
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="mt-6 grid w-full place-items-center rounded-[2rem] border-2 border-dashed border-forest/15 bg-white/50 px-6 py-12 text-center text-forest transition hover:border-leaf"
        >
          <MapPin className="size-8 text-leaf" />
          <span className="mt-3 font-bold">Add your first delivery address</span>
        </button>
      ) : (
        <div className={`mt-6 grid gap-4 ${compact ? '' : 'md:grid-cols-2'}`}>
          {query.data.map((address) => {
            const selected = selectedId === address.id;
            return (
              <motion.article
                key={address.id}
                layout
                className={`relative rounded-[2rem] border p-5 shadow-sm transition ${selected ? 'border-leaf bg-mint/55 ring-2 ring-leaf/15' : 'border-white/70 bg-white/70'}`}
              >
                {onSelect && (
                  <button
                    type="button"
                    onClick={() => onSelect(address.id)}
                    className="absolute inset-0 rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
                    aria-label={`Deliver to ${address.fullName}`}
                  />
                )}
                <div className="relative pointer-events-none flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-forest">{address.fullName}</h3>
                      {address.isDefault && (
                        <span className="rounded-full bg-forest px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-ink-muted">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                      <br />
                      {address.city}, {address.state} {address.postalCode}
                      <br />
                      {address.country} · {address.phone}
                    </p>
                  </div>
                  {selected && (
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-leaf text-white">
                      <Check className="size-4" />
                    </span>
                  )}
                </div>
                <div className="relative mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    className="min-h-11 px-4"
                    onClick={() => setEditing(address)}
                  >
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11 px-4 text-red-700"
                    onClick={() => setDeleting(address)}
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
      <Modal
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        title={editing?.id ? 'Edit address' : 'Add an address'}
        initialFocusSelector="input[name='fullName']"
        panelClassName="max-w-2xl"
        bodyClassName="[scrollbar-gutter:stable]"
        footer={
          <Button type="submit" form={addressFormId} loading={savingAddress} className="w-full">
            {editing?.id ? 'Save changes' : 'Add address'}
          </Button>
        }
      >
        <AddressForm
          address={editing}
          onSubmit={save}
          loading={savingAddress}
          formId={addressFormId}
          showSubmitButton={false}
        />
      </Modal>
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete address?">
        <p className="text-sm leading-6 text-ink-muted">
          This removes the address from your address book. Addresses attached to previous orders are
          retained and cannot be deleted.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            onClick={remove}
            loading={mutations.deleteAddress.isPending}
            className="bg-red-700 hover:bg-red-800"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
