import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Modal } from '@/components/ui/Modal';

function AddressModalHarness({ onSubmit }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open address modal
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add an address"
        initialFocusSelector="input[name='fullName']"
        footer={
          <button type="submit" form="test-address-form">
            Add address
          </button>
        }
      >
        <form id="test-address-form" onSubmit={onSubmit}>
          <label>
            Full name
            <input name="fullName" />
          </label>
        </form>
      </Modal>
    </>
  );
}

test('locks background scroll, focuses the form, submits from the fixed footer, and closes with Escape', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((event) => event.preventDefault());
  render(<AddressModalHarness onSubmit={onSubmit} />);

  const opener = screen.getByRole('button', { name: 'Open address modal' });
  await user.click(opener);

  const input = screen.getByRole('textbox', { name: 'Full name' });
  await waitFor(() => expect(input).toHaveFocus());
  expect(document.body.style.overflow).toBe('hidden');
  expect(document.documentElement.style.overflow).toBe('hidden');
  expect(screen.getByRole('dialog').parentElement?.parentElement).toBe(document.body);

  await user.click(screen.getByRole('button', { name: 'Add address' }));
  expect(onSubmit).toHaveBeenCalledOnce();

  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(document.body.style.overflow).toBe('');
  expect(document.documentElement.style.overflow).toBe('');
  expect(opener).toHaveFocus();
});
