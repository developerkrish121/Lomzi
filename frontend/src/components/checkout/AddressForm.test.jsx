import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { AddressForm } from '@/components/checkout/AddressForm';

test('validates and submits a default delivery address', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<AddressForm onSubmit={onSubmit} loading={false} />);

  await user.type(screen.getByRole('textbox', { name: 'Full name' }), 'Asha Rao');
  await user.type(screen.getByRole('textbox', { name: 'Phone' }), '+919876543210');
  await user.type(screen.getByRole('textbox', { name: 'Postal code' }), '560001');
  await user.type(screen.getByRole('textbox', { name: 'Address line 1' }), '42 Market Road');
  await user.type(screen.getByRole('textbox', { name: 'City' }), 'Bengaluru');
  await user.type(screen.getByRole('textbox', { name: 'State' }), 'Karnataka');
  await user.click(screen.getByRole('checkbox', { name: 'Make this my default address' }));
  await user.click(screen.getByRole('button', { name: 'Add address' }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  expect(onSubmit.mock.calls[0][0]).toEqual(
    expect.objectContaining({
      fullName: 'Asha Rao',
      addressLine1: '42 Market Road',
      isDefault: true,
    }),
  );
});
