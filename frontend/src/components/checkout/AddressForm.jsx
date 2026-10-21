import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { addressSchema } from '@/features/checkout/schemas';

const defaults = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

export function AddressForm({ address, onSubmit, loading, formId, showSubmitButton = true }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: address ? { ...defaults, ...address } : defaults,
  });
  const field = (name, label, props = {}) => (
    <Input
      id={`address-${name}`}
      label={label}
      error={errors[name]?.message}
      {...register(name)}
      {...props}
    />
  );
  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2"
      noValidate
    >
      <div className="min-w-0 sm:col-span-2">
        {field('fullName', 'Full name', { autoComplete: 'name' })}
      </div>
      {field('phone', 'Phone', { type: 'tel', autoComplete: 'tel' })}
      {field('postalCode', 'Postal code', { autoComplete: 'postal-code' })}
      <div className="min-w-0 sm:col-span-2">
        {field('addressLine1', 'Address line 1', { autoComplete: 'address-line1' })}
      </div>
      <div className="min-w-0 sm:col-span-2">
        {field('addressLine2', 'Address line 2 (optional)', { autoComplete: 'address-line2' })}
      </div>
      {field('city', 'City', { autoComplete: 'address-level2' })}
      {field('state', 'State', { autoComplete: 'address-level1' })}
      <div className="min-w-0 sm:col-span-2">
        {field('country', 'Country', { autoComplete: 'country-name' })}
      </div>
      <label className="flex items-center gap-3 rounded-2xl bg-mist p-4 text-sm font-bold text-forest sm:col-span-2">
        <input type="checkbox" {...register('isDefault')} className="size-4 accent-forest" /> Make
        this my default address
      </label>
      {showSubmitButton && (
        <Button type="submit" loading={loading} className="sm:col-span-2">
          {address ? 'Save changes' : 'Add address'}
        </Button>
      )}
    </form>
  );
}
